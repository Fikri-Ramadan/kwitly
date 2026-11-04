import { Body, Controller, Get, HttpCode, Param, Patch, Post, Put, Query } from '@nestjs/common';
import { InvoiceService } from './invoice.service.js';
import { User } from '../common/decorator/user.decorator.js';
import { InvoiceCreateDto, InvoiceFilterDto, StatusDto, InvoiceUpdateDto } from './dto/invoice.dto.js';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('Invoices')
@ApiBearerAuth()
@Controller('invoice')
export class InvoiceController {
  constructor(private invoiceService: InvoiceService) { }

  @Get()
  @ApiOperation({ summary: 'List invoices', description: 'Get invoices with advanced filtering and pagination.' })
  @ApiResponse({ status: 200, description: 'Return filtered list of invoices.' })
  async getAllMyInvoices(
    @Query() filters: InvoiceFilterDto,
    @User() user: { sub: string; }
  ) {
    return await this.invoiceService.findMyInvoices(user.sub, filters);
  }

  @Get(':invNumber')
  @ApiOperation({ summary: 'Get invoice details' })
  @ApiParam({ name: 'invNumber', example: 'INV-2026-0001' })
  @ApiResponse({ status: 200, description: 'Return invoice data with items.' })
  @ApiResponse({ status: 404, description: 'Invoice not found.' })
  async getInvoiceByNumber(
    @Param('invNumber') invNumber: string,
    @User() user: { sub: string; }
  ) {
    return await this.invoiceService.findInvoiceByNumber(user.sub, invNumber);
  }

  @Post()
  @HttpCode(201)
  @ApiOperation({ summary: 'Create invoice', description: 'Creates a manual invoice or sets up a recurring one.' })
  @ApiResponse({ status: 201, description: 'Invoice successfully created.' })
  @ApiResponse({ status: 403, description: 'Forbidden: Product/Client ownership validation failed.' })
  async createInvoice(
    @User() user: { sub: string; },
    @Body() createDto: InvoiceCreateDto
  ) {
    return await this.invoiceService.create(user.sub, { ...createDto });
  }

  @Put(':invNumber')
  @ApiOperation({ summary: 'Update invoice', description: 'Update a draft invoice. Also handles recurring setup.' })
  @ApiParam({ name: 'invNumber', example: 'INV-2026-0001' })
  @ApiResponse({ status: 200, description: 'Invoice successfully created.' })
  @ApiResponse({ status: 400, description: 'Only DRAFT invoices can be updated.' })
  async updateInvoice(
    @Param('invNumber') invNumber: string,
    @User() user: { sub: string; },
    @Body() updateDto: InvoiceUpdateDto
  ) {
    return await this.invoiceService.update(invNumber, user.sub, updateDto);
  }

  @Patch(':invNumber')
  @ApiOperation({ summary: 'Transition invoice status', description: 'Moves invoice status (e.g., DRAFT -> PENDING). Triggers email on PENDING.' })
  @ApiParam({ name: 'invNumber', example: 'INV-2026-0001' })
  @ApiResponse({ status: 200, description: 'Status updated.' })
  @ApiResponse({ status: 400, description: 'Invalid status transition.' })
  async updateInvoiceStatus(
    @Param('invNumber') invNumber: string,
    @Query() query: StatusDto,
    @User() user: { sub: string; },
  ) {
    return await this.invoiceService.updateStatus(invNumber, user.sub, query.status);
  }
}
