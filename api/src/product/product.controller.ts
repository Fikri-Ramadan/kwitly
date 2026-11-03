import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Post, Put, Query } from '@nestjs/common';
import { ProductService } from './product.service.js';
import { User } from '../common/decorator/user.decorator.js';
import { CreateDto, UpdateDto } from './dto/product.dto.js';

@Controller('product')
export class ProductController {

  constructor(
    private productService: ProductService
  ) { }

  @Get()
  async getMyProducts(
    @Query('cat') cat: string,
    @User() user: { sub: string; }
  ) {
    return await this.productService.findMyProducts(user.sub, cat);
  }

  @Get(':id')
  async getProductById(
    @Param('id', ParseUUIDPipe) id: string,
    @User() user: { sub: string; }
  ) {
    return await this.productService.findById(id, user.sub);
  }

  @Post()
  async createProduct(
    @User() user: { sub: string; },
    @Body() createDto: CreateDto
  ) {
    return await this.productService.create(user.sub, { ...createDto });
  }

  @Put(':id')
  async updateProduct(
    @Param('id', ParseUUIDPipe) id: string,
    @User() user: { sub: string; },
    @Body() updateDto: UpdateDto
  ) {
    return await this.productService.update(id, user.sub, { ...updateDto });
  }

  @Delete(':id')
  async deleteProductById(
    @Param('id', ParseUUIDPipe) id: string,
    @User() user: { sub: string; }
  ) {
    await this.productService.delete(id, user.sub);
    return { message: 'Product deleted successfully.' };
  }
}
