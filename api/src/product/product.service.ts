import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateDto, UpdateDto } from './dto/product.dto.js';
import { CategoryService } from '../category/category.service.js';

@Injectable()
export class ProductService {

  constructor(
    private prisma: PrismaService,
    private categoryService: CategoryService
  ) { }

  async findMyProducts(userId: string, catSlug: string) {
    return await this.prisma.product.findMany({
      where: { userId, deletedAt: null, category: { slug: { equals: catSlug } } },
      include: { category: { select: { id: true, name: true, slug: true } } }
    });
  }

  async findById(productId: string, userId: string) {
    return await this.isMyProduct(productId, userId);
  }

  async create(userId: string, data: CreateDto) {
    await this.categoryService.isMyCategory(data.categoryId, userId);
    return await this.prisma.product.create({
      data: { ...data, userId },
    });
  }

  async update(productId: string, userId: string, data: UpdateDto) {
    const myProduct = await this.isMyProduct(productId, userId);
    return await this.prisma.product.update({
      where: { id: myProduct.id },
      data: { ...data }
    });
  }

  async delete(productId: string, userId: string) {
    const myProduct = await this.isMyProduct(productId, userId);
    await this.prisma.product.update({
      where: { id: myProduct.id },
      data: { deletedAt: new Date() }
    });
  }

  async isMyProduct(id: string, userId: string) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true
          }
        }
      }
    });
    if (!product || product.deletedAt) throw new NotFoundException('Product not found.');
    if (product.userId !== userId) throw new ForbiddenException(`You don't have permission to access this product.`);
    return product;
  }
}
