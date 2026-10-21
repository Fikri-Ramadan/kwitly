import { Module } from '@nestjs/common';
import { ProductService } from './product.service.js';
import { ProductController } from './product.controller.js';
import { CategoryModule } from '../category/category.module.js';

@Module({
  imports: [CategoryModule],
  providers: [ProductService],
  controllers: [ProductController]
})
export class ProductModule { }
