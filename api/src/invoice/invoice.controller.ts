import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Patch, Post, Put, Query } from '@nestjs/common';
import { Public } from '../common/decorator/public.decorator.js';
import { InvoiceService } from './invoice.service.js';
import { User } from '../common/decorator/user.decorator.js';
import { CreateDto, StatusDto, UpdateDto } from './dto/invoice.dto.js';

@Controller('invoice')
export class InvoiceController {
  constructor(private invoiceService: InvoiceService) { }

  @Get()
  async getAllMyInvoices(
    @User() user: { sub: string; }
  ) {
    return await this.invoiceService.findMyInvoices(user.sub);
  }

  @Get(':invNumber')
  async getInvoiceByNumber(
    @Param('invNumber') invNumber: string,
    @User() user: { sub: string; }
  ) {
    return await this.invoiceService.findInvoiceByNumber(user.sub, invNumber);
  }

  @Post()
  async createInvoice(
    @User() user: { sub: string; },
    @Body() createDto: CreateDto
  ) {
    return await this.invoiceService.create(user.sub, { ...createDto });
  }

  @Put(':invNumber')
  async updateInvoice(
    @Param('invNumber') invNumber: string,
    @User() user: { sub: string; },
    @Body() updateDto: UpdateDto
  ) {
    return await this.invoiceService.update(invNumber, user.sub, updateDto);
  }

  @Patch(':invNumber')
  async updateInvoiceStatus(
    @Param('invNumber') invNumber: string,
    @Query() query: StatusDto,
    @User() user: { sub: string; },
  ) {
    return await this.invoiceService.updateStatus(invNumber, user.sub, query.status)
  }
}
