import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateDto } from './dto/invoice.dto.js';
import { ProductService } from '../product/product.service.js';

@Injectable()
export class InvoiceService {
  constructor(
    private prisma: PrismaService,
    private productService: ProductService
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
    const { items, taxPercent = 0, ...invoiceData } = data;

    return await this.prisma.$transaction(async (tx) => {
      const productIds = [...new Set(items.map(item => item.productId))];
      const isValid = await this.productService.validateUserProducts(productIds, userId);
      if (!isValid) throw new ForbiddenException('One or more products are invalid or do not belong to you.');

      let subtotal = 0;
      const itemsToCreate = items.map(item => {
        subtotal += item.unitPrice * item.quantity;
        return {
          productId: item.productId,
          description: item.description,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
        };
      });

      const taxAmount = (subtotal * taxPercent) / 100;
      const total = subtotal + taxAmount;
      const invoice = await tx.invoice.create({
        data: {
          ...invoiceData,
          userId,
          number: await this.generateNumber(),
          tax: taxAmount,
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

  private async isMyInvoice(invoiceNumber: string, userId: string) {
    const invoice = await this.prisma.invoice.findUnique({
      where: {
        userId_number: {
          userId,
          number: invoiceNumber,
        }
      },
      include: {
        items: true
      }
    });
    if (!invoice) throw new NotFoundException('Invoice not found.');
    if (invoice.userId !== userId) throw new ForbiddenException(`You don't have permission to access this invoice.`);
    return invoice;
  }

  private async generateNumber() {
    const thisYear = new Date().getFullYear();
    const count = await this.prisma.invoice.count({
      where: {
        createdAt: {
          gte: new Date(`${thisYear}-01-01T00:00:00.000Z`),
          lt: new Date(`${thisYear + 1}-01-01T00:00:00.000Z`)
        }
      },
    });
    const sequentialNumber = String(count + 1).padStart(4, '0');
    return `INV-${thisYear}-${sequentialNumber}`;
  }
}
