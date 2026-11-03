import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Post, Put, Query } from '@nestjs/common';
import { CategoryService } from './category.service.js';
import { User } from '../common/decorator/user.decorator.js';
import { CreateDto, UpdateDto } from './dto/category.dto.js';

@Controller('category')
export class CategoryController {

  constructor(private categoryService: CategoryService) { }

  @Get()
  async getMyCategories(@User() user: { sub: string; }) {
    return await this.categoryService.findCategoriesByUserId(user.sub);
  }

  @Post()
  async createCategory(
    @User() user: { sub: string; },
    @Body() createDto: CreateDto
  ) {
    return await this.categoryService.create(user.sub, { ...createDto });
  }

  @Put(':id')
  async updateCategory(
    @Param('id', ParseUUIDPipe) id: string,
    @User() user: { sub: string; },
    @Body() updateDto: UpdateDto
  ) {
    return await this.categoryService.update(id, user.sub, { ...updateDto });
  }

  @Delete(':id')
  async deleteCategoryById(
    @Param('id', ParseUUIDPipe) id: string,
    @User() user: { sub: string; },
  ) {
    await this.categoryService.delete(id, user.sub);
    return { message: 'Category deleted successfully.' };
  }
}
