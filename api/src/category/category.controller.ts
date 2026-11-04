import { Body, Controller, Delete, Get, HttpCode, Param, ParseUUIDPipe, Post, Put, Query } from '@nestjs/common';
import { CategoryService } from './category.service.js';
import { User } from '../common/decorator/user.decorator.js';
import { CategoryCreateDto, CategoryUpdateDto } from './dto/category.dto.js';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('Categories')
@ApiBearerAuth()
@Controller('category')
export class CategoryController {

  constructor(private categoryService: CategoryService) { }

  @Get()
  @ApiOperation({summary: 'List all categories', description: 'Retrieve all active categories belonging to the logged-in user.'})
  @ApiResponse({ status: 200, description: 'Return list of categories.'})
  async getMyCategories(@User() user: { sub: string; }) {
    return await this.categoryService.findCategoriesByUserId(user.sub);
  }

  @Post()
  @HttpCode(201)
  @ApiOperation({summary: 'Create a new category'})
  @ApiResponse({ status: 201, description: 'Category successfuly created.'})
  async createCategory(
    @User() user: { sub: string; },
    @Body() createDto: CategoryCreateDto
  ) {
    return await this.categoryService.create(user.sub, { ...createDto });
  }

  @Put(':id')
  @ApiOperation({summary: 'Update an existing category'})
  @ApiParam({name: 'id', description: 'The UUID of the category'})
  @ApiResponse({status: 200, description: 'Category successfully updated.'})
  @ApiResponse({status: 404, description: 'Category not found.'})
  async updateCategory(
    @Param('id', ParseUUIDPipe) id: string,
    @User() user: { sub: string; },
    @Body() updateDto: CategoryUpdateDto
  ) {
    return await this.categoryService.update(id, user.sub, { ...updateDto });
  }

  @Delete(':id')
  @ApiOperation({summary: 'Delete a category', description: 'Performs a soft delete on the specified category.'})
  @ApiParam({name: 'id', description: 'The UUID of the category'})
  @ApiResponse({status: 200, description: 'Category successfully deleted.'})
  async deleteCategoryById(
    @Param('id', ParseUUIDPipe) id: string,
    @User() user: { sub: string; },
  ) {
    await this.categoryService.delete(id, user.sub);
    return { message: 'Category deleted successfully.' };
  }
}
