import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateDto, UpdateDto } from './dto/category.dto.js';
import { nanoid } from 'nanoid';
import slugify from 'slugify';

@Injectable()
export class CategoryService {

  constructor(
    private prisma: PrismaService
  ) { }

  async findCategoriesByUserId(userId: string) {
    return await this.prisma.category.findMany({
      where: { userId, deletedAt: null }
    });
  }

  async create(userId: string, data: CreateDto) {
    const baseSlug = slugify(data.name, { lower: true, strict: true });

    return await this.prisma.category.create({
      data: {
        ...data,
        userId,
        slug: `${baseSlug}-${nanoid(4)}`
      }
    });
  }

  async update(categoryId: string, userId: string, data: UpdateDto) {
    const category = await this.isMyCategory(categoryId, userId);
    return await this.prisma.category.update({
      where: { id: category.id },
      data: { ...data }
    });
  }

  async delete(categoryId: string, userId: string) {
    const category = await this.isMyCategory(categoryId, userId);
    await this.prisma.category.update({
      where: { id: category.id },
      data: { deletedAt: new Date() }
    });
  }

  async isMyCategory(categoryId: string, userId: string) {
    const category = await this.prisma.category.findUnique({
      where: { id: categoryId, deletedAt: null }
    });
    if (!category || category.deletedAt) throw new NotFoundException('Category not found.');
    if (category.userId !== userId) throw new ForbiddenException(`You don't have permission to access this category.`);
    return category;
  }
}
