import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CategoryCreateDto, CategoryUpdateDto } from './dto/category.dto.js';
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

  async create(userId: string, data: CategoryCreateDto) {
    const baseSlug = slugify(data.name, { lower: true, strict: true });

    return await this.prisma.category.create({
      data: {
        ...data,
        userId,
        slug: `${baseSlug}-${nanoid(4)}`
      }
    });
  }

  async update(categoryId: string, userId: string, data: CategoryUpdateDto) {
    const category = await this.isMyCategory(categoryId, userId);
    let newSlug = undefined;
    if (data.name && data.name !== category.name) {
      const baseSlug = slugify(data.name, { lower: true, strict: true });
      newSlug = `${baseSlug}-${nanoid(4)}`;
    }
    return await this.prisma.category.update({
      where: { id: category.id },
      data: { ...data, ...(newSlug && { slug: newSlug }) }
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
