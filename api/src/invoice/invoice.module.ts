import { Module } from '@nestjs/common';
import { InvoiceService } from './invoice.service.js';
import { InvoiceController } from './invoice.controller.js';
import { ProductModule } from '../product/product.module.js';

@Module({
  imports: [ProductModule],
  providers: [InvoiceService],
  controllers: [InvoiceController]
})
export class InvoiceModule { }
