import { BadRequestException, ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateDto, UpdateDto } from './dto/invoice.dto.js';
import { ProductService } from '../product/product.service.js';
import { ClientService } from '../client/client.service.js';
import { Frequency, InvoiceStatus, Prisma } from '../generated/prisma/client.js';

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

@Injectable()
export class InvoiceService {
  constructor(
    private prisma: PrismaService,
    private productService: ProductService,
    private clientService: ClientService
  ) { }

  async findInvoiceByNumber(userId: string, invoiceNumber: string) {
    return await this.isMyInvoice(invoiceNumber, userId);
  }

  async findMyInvoices(userId: string) {
    return await this.prisma.invoice.findMany({
      where: { userId }
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

    return await this.prisma.invoice.update({
      where: { id: invoice.id },
      data: {
        status,
        paidAt: status === 'PAID' ? new Date() : null
      }
    });
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
}
