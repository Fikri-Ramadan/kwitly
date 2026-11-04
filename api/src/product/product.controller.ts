import { Body, Controller, Delete, Get, HttpCode, Param, ParseUUIDPipe, Post, Put, Query } from '@nestjs/common';
import { ProductService } from './product.service.js';
import { User } from '../common/decorator/user.decorator.js';
import { ProductCreateDto, ProductUpdateDto } from './dto/product.dto.js';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('Products')
@ApiBearerAuth()
@Controller('product')
export class ProductController {
  constructor(private productService: ProductService) { }

  @Get()
  @ApiOperation({ summary: 'List all products', description: 'Retrieve products. Optionally filter by category slug.' })
  @ApiQuery({ name: 'cat', required: false, description: 'Filter by category slug' })
  @ApiResponse({ status: 200, description: 'Return list of products.' })
  async getMyProducts(
    @Query('cat') cat: string,
    @User() user: { sub: string; }
  ) {
    return await this.productService.findMyProducts(user.sub, cat);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get product detail' })
  @ApiParam({ name: 'id', description: 'The UUID of the product' })
  @ApiResponse({ status: 200, description: 'Return product details.' })
  @ApiResponse({ status: 404, description: 'Product not found.' })
  async getProductById(
    @Param('id', ParseUUIDPipe) id: string,
    @User() user: { sub: string; }
  ) {
    return await this.productService.findById(id, user.sub);
  }

  @Post()
  @HttpCode(201)
  @ApiOperation({ summary: 'Create new product' })
  @ApiResponse({ status: 201, description: 'Product successfully created.' })
  @ApiResponse({ status: 403, description: 'Category does not belong to user.' })
  async createProduct(
    @User() user: { sub: string; },
    @Body() createDto: ProductCreateDto
  ) {
    return await this.productService.create(user.sub, { ...createDto });
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update product' })
  @ApiParam({ name: 'id', description: 'The UUID of the product' })
  async updateProduct(
    @Param('id', ParseUUIDPipe) id: string,
    @User() user: { sub: string; },
    @Body() updateDto: ProductUpdateDto
  ) {
    return await this.productService.update(id, user.sub, { ...updateDto });
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Deleted product (Soft delete)' })
  @ApiParam({ name: 'id', description: 'The UUID of the product' })
  async deleteProductById(
    @Param('id', ParseUUIDPipe) id: string,
    @User() user: { sub: string; }
  ) {
    await this.productService.delete(id, user.sub);
    return { message: 'Product deleted successfully.' };
  }
}
