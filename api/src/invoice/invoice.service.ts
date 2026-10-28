import { BadRequestException, ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateDto, UpdateDto } from './dto/invoice.dto.js';
import { ProductService } from '../product/product.service.js';
import { ClientService } from '../client/client.service.js';
import { InvoiceStatus, Prisma } from '../generated/prisma/client.js';

const ALLOWED_TRANSITION: Record<InvoiceStatus, InvoiceStatus[]> = {
  DRAFT: ['PENDING', 'CANCELLED'],
  PENDING: ['PAID', 'OVERDUE', 'CANCELLED'],
  OVERDUE: ['PAID', 'CANCELLED'],
  PAID: [],
  CANCELLED: []
};

const USER_SETABLE: InvoiceStatus[] = ['PENDING', 'PAID', 'CANCELLED'];

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
      items, taxPercent = 0, clientId, issueDate, dueDate, status, notes, paymentTerms
    } = data;

    this.validateDate(issueDate, dueDate);

    return await this.prisma.$transaction(async (tx) => {
      await this.clientService.isMyClient(clientId, userId);
      const productIds = [...new Set(items.map(item => item.productId))];
      const isValid = await this.productService.validateUserProducts(productIds, userId);
      if (!isValid) throw new ForbiddenException('One or more products are invalid or do not belong to you.');

      const number = await this.generateNumber(tx, userId);
      const { subtotal, tax, total } = this.calculateTotals(items, taxPercent);
      const itemsToCreate = items.map(item => ({
        productId: item.productId,
        description: item.description,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
      }));

      const invoice = await tx.invoice.create({
        data: {
          userId,
          clientId,
          number,
          issueDate,
          dueDate,
          status: status === 'PENDING' ? 'PENDING' : 'DRAFT',
          notes,
          paymentTerms,
          taxPercent,
          tax,
          subtotal,
          total,
          items: {
            create: itemsToCreate
          }
        },
      });

      return invoice;
    });
  }

  async update(invoiceNumber: string, userId: string, data: UpdateDto) {
    const invoice = await this.isMyInvoice(invoiceNumber, userId);
    if (invoice.status !== 'DRAFT') throw new BadRequestException('Unable to update invoice because status is not DRAFT.');

    const { items, ...invoiceData } = data;
    this.validateDate(invoiceData.issueDate ?? invoice.issueDate, invoiceData.dueDate ?? invoice.dueDate);
    if (items === undefined || items?.length === 0) {
      throw new BadRequestException('Invoice must have at least one item.');
    }

    if (invoiceData.clientId) {
      await this.clientService.isMyClient(invoiceData.clientId, userId);
    }

    if (items) {
      const productIds = [...new Set(data.items?.map(item => item.productId))];
      const isValid = await this.productService.validateUserProducts(productIds, userId);
      if (!isValid) throw new ForbiddenException('One or more products are invalid or do not belong to you.');
    }

    const recalc = items !== undefined || invoiceData.taxPercent !== undefined;
    const totals = recalc ? this.calculateTotals(items ?? invoice.items, invoiceData.taxPercent ?? invoice.taxPercent)
      : undefined;

    return this.prisma.$transaction(async (tx) => {
      const { count } = await tx.invoice.updateMany({
        where: { id: invoice.id, status: 'DRAFT' },
        data: {
          clientId: invoiceData.clientId,
          issueDate: invoiceData.issueDate,
          dueDate: invoiceData.dueDate,
          paymentTerms: invoiceData.paymentTerms,
          notes: invoiceData.notes,
          taxPercent: invoiceData.taxPercent,
          ...(totals && { subtotal: totals.subtotal, tax: totals.tax, total: totals.total })
        }
      });

      if (count !== 1) throw new ConflictException('Invoice is no longer a DRAFT. Reload and try again.');

      if (data.items) {
        await tx.invoiceItem.deleteMany({ where: { invoiceId: invoice.id } });
        await tx.invoiceItem.createMany({
          data: data.items.map((it) => ({
            invoiceId: invoice.id,
            productId: it.productId,
            description: it.description,
            quantity: it.quantity,
            unitPrice: it.unitPrice,
          })),
        });
      }

      return await tx.invoice.findUniqueOrThrow({
        where: { id: invoice.id },
        include: { items: true }
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
      }
    });
    if (!invoice) throw new NotFoundException('Invoice not found.');
    return invoice;
  }

  private validateDate(issueDate: Date, dueDate: Date) {
    if (new Date(dueDate) < new Date(issueDate))
      throw new BadRequestException('Due date cannot be before issue date.');
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
}
