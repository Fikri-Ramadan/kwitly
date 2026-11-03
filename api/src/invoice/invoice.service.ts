import { BadRequestException, ConflictException, ForbiddenException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateDto, UpdateDto } from './dto/invoice.dto.js';
import { ProductService } from '../product/product.service.js';
import { ClientService } from '../client/client.service.js';
import { Frequency, InvoiceStatus, Prisma } from '../generated/prisma/client.js';
import { Cron, CronExpression } from '@nestjs/schedule';
import { MailService } from '../auth/mail.service.js';

const ALLOWED_TRANSITION: Record<InvoiceStatus, InvoiceStatus[]> = {
  DRAFT: ['PENDING', 'CANCELLED'],
  PENDING: ['PAID', 'OVERDUE', 'CANCELLED'],
  OVERDUE: ['PAID', 'CANCELLED'],
  PAID: [],
  CANCELLED: []
};
const USER_SETABLE: InvoiceStatus[] = ['PENDING', 'PAID', 'CANCELLED'];

type RecurringTemplate = {
  items: { productId: string; description: string; quantity: number; unitPrice: number; }[];
  taxPercent: number;
  dueInDays: number;
  paymentTerms?: string;
  notes?: string;
  autoSend: boolean;
};

type FilterType = {
  search?: string;
  clientId?: string;

  status?: InvoiceStatus;
  isRecurring?: boolean;

  startDate?: Date;
  endDate?: Date;
  dueStartDate?: Date;
  dueEndDate?: Date;

  minTotal?: number;
  maxTotal?: number;

  sortBy?: 'issueDate' | 'dueDate' | 'total' | 'number';
  sortOrder?: 'asc' | 'desc';
  page?: number,
  limit?: number,
};

@Injectable()
export class InvoiceService {
  private readonly logger = new Logger(InvoiceService.name);

  constructor(
    private prisma: PrismaService,
    private productService: ProductService,
    private clientService: ClientService,
    private mailService: MailService
  ) { }

  async findInvoiceByNumber(userId: string, invoiceNumber: string) {
    return await this.isMyInvoice(invoiceNumber, userId);
  }

  async findMyInvoices(userId: string, filters: FilterType) {
    const {
      search, status, clientId, startDate, endDate,
      dueEndDate, dueStartDate, minTotal, maxTotal,
      page = 1, limit = 10
    } = filters;

    return await this.prisma.invoice.findMany({
      where: {
        userId,
        ...(search && {
          OR: [
            { number: { contains: search, mode: 'insensitive' } },
            { client: { name: { contains: search, mode: 'insensitive' } } },
            { notes: { contains: search, mode: 'insensitive' } }
          ]
        }),
        ...(status && { status }),
        ...(clientId && { clientId }),
        ...((startDate || endDate) && {
          issueDate: {
            ...(startDate && { gte: new Date(startDate) }),
            ...(endDate && { lte: new Date(endDate) }),
          }
        }),
        ...((dueStartDate || dueEndDate) && {
          dueDate: {
            ...(dueStartDate && { gte: new Date(dueStartDate) }),
            ...(dueEndDate && { lte: new Date(dueEndDate) }),
          }
        }),
        ...((minTotal || maxTotal) && {
          total: {
            ...(minTotal && { gte: minTotal }),
            ...(maxTotal && { lte: maxTotal }),
          }
        }),
      },
      skip: (page - 1) * limit,
      take: limit,
      include: { client: true, recurring: true },
      orderBy: {
        [filters.sortBy || 'createdAt']: filters.sortOrder || 'desc',
      },
    });
  }

  async create(userId: string, data: CreateDto) {
    const {
      items, taxPercent = 0, clientId, issueDate, dueDate, status,
      notes, paymentTerms, recurringFrequency, recurringEndDate, autoSend, dueInDays
    } = data;

    this.validateDate(issueDate, dueDate);
    await this.clientService.isMyClient(clientId, userId);

    const productIds = [...new Set(items.map(item => item.productId))];
    const isValid = await this.productService.validateUserProducts(productIds, userId);
    if (!isValid) throw new ForbiddenException('One or more products are invalid or do not belong to you.');

    const { subtotal, tax, total } = this.calculateTotals(items, taxPercent);
    const itemsToCreate = items.map(item => ({
      productId: item.productId,
      description: item.description,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
    }));

    return await this.prisma.$transaction(async (tx) => {
      const number = await this.generateNumber(tx, userId);

      const shouldCreateRecurring = recurringFrequency && recurringEndDate && typeof autoSend === 'boolean' && typeof dueInDays === 'number';
      const recurringId = shouldCreateRecurring ?
        await this.handleRecurring(tx, {
          userId, clientId, issueDate,
          endDate: recurringEndDate,
          frequency: recurringFrequency,
          template: {
            autoSend, taxPercent, notes, paymentTerms, dueInDays, items: itemsToCreate,
          }
        }) : null;

      const invoice = await tx.invoice.create({
        data: {
          userId, clientId, number, issueDate, dueDate, notes,
          paymentTerms, taxPercent, tax, subtotal, total, recurringId,
          status: status === 'PENDING' ? 'PENDING' : 'DRAFT',
          items: { create: itemsToCreate },
        },
      });

      return await tx.invoice.findUniqueOrThrow({
        where: { id: invoice.id },
        include: { items: true, recurring: true }
      });
    });
  }

  async update(invoiceNumber: string, userId: string, data: UpdateDto) {
    const invoice = await this.isMyInvoice(invoiceNumber, userId);
    if (invoice.status !== 'DRAFT') throw new BadRequestException('Only DRAFT invoices can be updated.');

    const {
      items, recurringFrequency, recurringEndDate, autoSend, dueInDays, ...newInvoiceData
    } = data;

    if (items !== undefined && items.length === 0) {
      throw new BadRequestException('Invoice must have at least one item.');
    }

    const issueDate = newInvoiceData.issueDate ?? invoice.issueDate;
    const dueDate = newInvoiceData.dueDate ?? invoice.dueDate;
    this.validateDate(issueDate, dueDate);

    if (newInvoiceData.clientId) await this.clientService.isMyClient(newInvoiceData.clientId, userId);
    if (items) {
      const productIds = [...new Set(items.map(item => item.productId))];
      const isValid = await this.productService.validateUserProducts(productIds, userId);
      if (!isValid) throw new ForbiddenException('One or more products are invalid or do not belong to you.');
    }

    const itemsToStore = (items ?? invoice.items).map(it => ({
      productId: it.productId,
      description: it.description,
      quantity: Number(it.quantity),
      unitPrice: Number(it.unitPrice),
    }));
    const taxPercent = newInvoiceData.taxPercent ?? invoice.taxPercent;
    const totals = items !== undefined || newInvoiceData.taxPercent !== undefined
      ? this.calculateTotals(itemsToStore, taxPercent)
      : null;

    // ---- recurring ----
    const tpl = invoice.recurring?.template as RecurringTemplate | undefined;
    const removeRecurring = recurringFrequency === null && !!invoice.recurringId;
    const frequency = recurringFrequency ?? invoice.recurring?.frequency;
    const finalRecurringEndDate = recurringEndDate ?? invoice.recurring?.endDate;

    if (recurringFrequency && !finalRecurringEndDate) {
      throw new BadRequestException('recurringEndDate is required when recurringFrequency is set.');
    }
    if (finalRecurringEndDate) {
      this.validateDate(issueDate, finalRecurringEndDate, 'Recurring end date cannot be before issue date.');
    }

    const recurringInput = recurringFrequency !== undefined || recurringEndDate !== undefined;
    const touchesTemplate = [
      items, autoSend, dueInDays, newInvoiceData.taxPercent, newInvoiceData.notes,
      newInvoiceData.paymentTerms, newInvoiceData.clientId, newInvoiceData.issueDate,
    ].some(v => v !== undefined);
    const syncRecurring = !removeRecurring && !!frequency && !!finalRecurringEndDate && (recurringInput || touchesTemplate);

    return this.prisma.$transaction(async (tx) => {
      let recurringId = invoice.recurringId;

      if (syncRecurring) {
        recurringId = await this.handleRecurring(tx, {
          userId,
          clientId: newInvoiceData.clientId ?? invoice.clientId,
          issueDate,
          endDate: finalRecurringEndDate!,
          frequency: frequency!,
          template: {
            autoSend: autoSend ?? tpl?.autoSend ?? false,
            taxPercent: Number(taxPercent),
            notes: newInvoiceData.notes ?? invoice.notes ?? '',
            paymentTerms: newInvoiceData.paymentTerms ?? invoice.paymentTerms ?? '',
            dueInDays: dueInDays ?? tpl?.dueInDays ?? 1,
            items: itemsToStore,
          }
        }, invoice.recurringId);
      } else if (removeRecurring) {
        recurringId = null;
      }

      try {
        await tx.invoice.update({
          where: { id: invoice.id, status: 'DRAFT' },
          data: {
            ...newInvoiceData,
            recurringId,
            ...(totals && { subtotal: totals.subtotal, tax: totals.tax, total: totals.total }),
            ...(items && {
              items: {
                deleteMany: {},
                create: itemsToStore
              }
            })
          }
        });
      } catch (e) {
        if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2025') {
          throw new ConflictException('Invoice was changed by another request. Please refresh and try again.');
        }
        throw e;
      }

      if (removeRecurring) {
        await tx.recurringInvoice.delete({ where: { id: invoice.recurringId! } });
      }

      return await tx.invoice.findUniqueOrThrow({
        where: { id: invoice.id },
        include: { items: true, recurring: true }
      });
    });
  }

  async updateStatus(invoiceNumber: string, userId: string, status: InvoiceStatus) {
    const invoice = await this.isMyInvoice(invoiceNumber, userId);
    if (!USER_SETABLE.includes(status)) {
      throw new ForbiddenException(`You are unable set status: ${status}.`);
    }
    if (!ALLOWED_TRANSITION[invoice.status].includes(status)) {
      throw new BadRequestException(`Invoice status cannot set ${invoice.status} to ${status}.`);
    }

    const updatedInvoice = await this.prisma.invoice.update({
      where: { id: invoice.id },
      data: {
        status,
        paidAt: status === 'PAID' ? new Date() : null
      },
      include: {
        client: true,
        user: { include: { profile: true } }
      }
    });
    if (updatedInvoice.status === 'PENDING') {
      await this.mailService.sendInvoice(
        updatedInvoice.client.email,
        updatedInvoice.user.profile?.company ?? updatedInvoice.user.profile?.fullName ?? updatedInvoice.user.email,
        {
          number: updatedInvoice.number,
          clientName: updatedInvoice.client.name,
          currency: 'IDR',
          total: Number(updatedInvoice.total).toLocaleString(),
          dueDate: updatedInvoice.dueDate.toLocaleDateString('id-ID')
        }
      );
    }

    return updatedInvoice;
  }

  private async isMyInvoice(invoiceNumber: string, userId: string) {
    const invoice = await this.prisma.invoice.findUnique({
      where: {
        userId_number: {
          userId,
          number: invoiceNumber,
        }
      },
      include: {
        items: true,
        recurring: true
      }
    });
    if (!invoice) throw new NotFoundException('Invoice not found.');
    return invoice;
  }

  private async handleRecurring(
    tx: Prisma.TransactionClient, data: {
      userId: string,
      clientId: string,
      frequency: Frequency,
      issueDate: Date,
      endDate: Date;
      template: RecurringTemplate;
    },
    existingId?: string | null
  ) {
    const anchorDay = data.issueDate.getUTCDate();
    const nextRunAt = this.computeNextRun(data.frequency, data.issueDate, anchorDay);

    const payload = {
      clientId: data.clientId,
      userId: data.userId,
      frequency: data.frequency,
      anchorDay,
      nextRunAt,
      endDate: data.endDate,
      template: data.template as any
    };

    if (existingId) {
      const updated = await tx.recurringInvoice.update({
        where: { id: existingId },
        data: payload
      });
      return updated.id;
    }

    const created = await tx.recurringInvoice.create({ data: payload });
    return created.id;
  }

  private validateDate(fromDate: Date, toDate: Date, message?: string) {
    if (new Date(toDate) < new Date(fromDate)) {
      throw new BadRequestException(message || 'End date cannot be before start date.');
    }
  }

  private calculateTotals(
    lines: { unitPrice: number, quantity: Prisma.Decimal | number | string; }[],
    taxPercent: Prisma.Decimal | number | string
  ) {
    const subtotal = lines.reduce(
      (acc, curr) => acc.plus(new Prisma.Decimal(curr.unitPrice).mul(curr.quantity)),
      new Prisma.Decimal(0)
    );
    const tax = subtotal.mul(taxPercent).div(100).toDecimalPlaces(2);
    return {
      subtotal,
      tax,
      total: subtotal.plus(tax),
    };
  }

  private async generateNumber(tx: Prisma.TransactionClient, userId: string) {
    const year = new Date().getFullYear();
    const count = await tx.invoiceCounter.upsert({
      where: { userId_year: { userId, year } },
      create: { userId, year, last: 1 },
      update: { last: { increment: 1 } }
    });
    const sequentialNumber = String(count.last).padStart(4, '0');
    return `INV-${year}-${sequentialNumber}`;
  }

  private computeNextRun(
    frequency: Frequency,
    from: Date,
    anchorDay: number
  ): Date {
    switch (frequency) {
      case 'WEEKLY':
        return new Date(from.getTime() + 7 * 24 * 60 * 60 * 1000);
      case 'MONTHLY':
        return this.addMonthsClamped(from, 1, anchorDay);
      case 'YEARLY':
        return this.addMonthsClamped(from, 12, anchorDay);
    }
  }

  private addMonthsClamped(from: Date, months: number, anchorDay: number): Date {
    const year = from.getUTCFullYear();
    const month = from.getUTCMonth() + months;
    const lastDay = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
    return new Date(Date.UTC(year, month, Math.min(lastDay, anchorDay)));
  }

  @Cron(CronExpression.EVERY_DAY_AT_2AM, {
    timeZone: 'Asia/Jakarta'
  })
  async handleStatusInvoices() {
    const now = new Date();
    const { count } = await this.prisma.invoice.updateMany({
      where: {
        status: {
          notIn: ['PAID', 'DRAFT', 'OVERDUE', 'CANCELLED']
        },
        dueDate: { lte: now }
      },
      data: {
        status: 'OVERDUE'
      }
    });
    this.logger.log(`Total invoice changed to OVERDUE: ${count}`);
  }

  @Cron(CronExpression.EVERY_DAY_AT_5AM, {
    timeZone: 'Asia/Jakarta'
  })
  async handleRecurringInvoices() {
    const now = new Date();
    this.logger.log(`Cron started: Processing recurring invoices at ${now.toISOString()}`);
    const recurringInvoices = await this.prisma.recurringInvoice.findMany({
      where: {
        isActive: true,
        endDate: { gte: now },
        nextRunAt: { lte: now },
      },
      include: { client: true }
    });

    if (recurringInvoices.length === 0) {
      this.logger.log('No recurring invoices due for processing.');
      return;
    }

    for (const rec of recurringInvoices) {
      try {
        await this.prisma.$transaction(async (tx) => {
          const template: RecurringTemplate = rec.template as unknown as RecurringTemplate;
          const { tax, subtotal, total } = this.calculateTotals(template.items, template.taxPercent);
          const dueDate = new Date(now);
          dueDate.setDate(now.getDate() + template.dueInDays);

          const itemsToCreate = template.items.map(item => ({
            productId: item.productId,
            description: item.description,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
          }));

          const newInvoice = await tx.invoice.create({
            data: {
              number: await this.generateNumber(tx, rec.userId),
              recurringId: rec.id,
              userId: rec.userId,
              clientId: rec.clientId,
              issueDate: now,
              dueDate,
              status: 'PENDING',
              taxPercent: template.taxPercent,
              tax, subtotal, total,
              ...(template.notes && { notes: template.notes }),
              ...(template.paymentTerms && { paymentTerms: template.notes }),
              items: { create: itemsToCreate },
            },
            include: {
              client: true,
              user: { include: { profile: true } }
            }
          });

          const newNextRunAt = this.computeNextRun(rec.frequency, rec.nextRunAt, rec.anchorDay);
          await tx.recurringInvoice.update({
            where: { id: rec.id },
            data: {
              nextRunAt: newNextRunAt,
              lastRunAt: now
            }
          });

          if (template.autoSend) {
            this.mailService.sendInvoice(
              rec.client.email,
              newInvoice.user.profile?.company ?? newInvoice.user.profile?.fullName ?? newInvoice.user.email,
              {
                number: newInvoice.number,
                clientName: rec.client.name,
                currency: 'IDR',
                total: Number(total).toLocaleString(),
                dueDate: dueDate.toLocaleDateString('id-ID')
              }
            );
          }

          this.logger.log(`Successfully generated invoice ${newInvoice.number} for recurring ID: ${rec.id}`);
        });
      } catch (error: any) {
        this.logger.error(`[Cron Error] Recurring ID ${rec.id}: ${error?.message}`, error?.stack);
      }
    }
  }
}
