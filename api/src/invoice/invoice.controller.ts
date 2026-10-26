import { Body, Controller, Get, Param, ParseUUIDPipe, Post } from '@nestjs/common';
import { Public } from '../common/decorator/public.decorator.js';
import { InvoiceService } from './invoice.service.js';
import { User } from '../common/decorator/user.decorator.js';
import { CreateDto } from './dto/invoice.dto.js';

@Controller('invoice')
export class InvoiceController {
  constructor(private invoiceService: InvoiceService) { }

  @Get()
  async getAllMyInvoices(
    @User() user: { sub: string; }
  ) {
    return await this.invoiceService.findMyInvoices(user.sub);
  }

  @Get(':id')
  async getInvoiceByNumber(
    @Param('id') id: string,
    @User() user: { sub: string; }
  ) {
    return await this.invoiceService.findInvoiceByNumber(user.sub, id);
  }

  @Post()
  async createInvoice(
    @User() user: { sub: string; },
    @Body() createDto: CreateDto
  ) {
    return await this.invoiceService.create(user.sub, { ...createDto });
  }
}
