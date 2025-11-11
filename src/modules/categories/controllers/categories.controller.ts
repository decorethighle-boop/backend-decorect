import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
  Res,
  UsePipes,
} from '@nestjs/common';
import type { Response } from 'express';
import { CreateOrUpdateCategoryValueDto } from '../dto/create-or-update-category-value.dto';
import { CreateOrUpdateCategoryDto } from '../dto/create-or-update-category.dto';
import { CreateOrUpdateCategoryValuePipe } from '../pipes/create-or-update-category-value/create-or-update-category-value.pipe';
import { CreateOrUpdateParentPipe } from '../pipes/create-or-update-parent/create-or-update-parent.pipe';
import { CategoriesService } from '../services/categories.service';
import type { FilterCategories } from '../types/filter-categories.type';

@Controller('categories')
export class CategoriesController {
  constructor(private readonly service: CategoriesService) {}
  // --------------------------------------------------------------------------------
  // Categories
  // --------------------------------------------------------------------------------

  @Get('parent')
  async getCategories(
    @Query() filters: FilterCategories,
    @Res() res: Response,
  ) {
    try {
      const categories = await this.service.getCategories(filters);
      return res.status(HttpStatus.OK).json({
        success: true,
        data: categories,
        message: 'Categories fetched',
      });
    } catch (error) {
      return res.status(error.status || HttpStatus.UNAUTHORIZED).json({
        success: false,
        data: null,
        message: error.message || 'Categories fetch failed',
      });
    }
  }

  @Post('parent')
  @UsePipes(CreateOrUpdateParentPipe)
  async createCategory(
    @Body() body: CreateOrUpdateCategoryDto,
    @Res() res: Response,
  ) {
    try {
      await this.service.createCategory(body);
      return res.status(HttpStatus.OK).json({
        success: true,
        data: null,
        message: 'Category created',
      });
    } catch (error) {
      return res.status(error.status || HttpStatus.UNAUTHORIZED).json({
        success: false,
        data: null,
        message: error.message || 'Error creating category',
      });
    }
  }

  @Put('parent/:id')
  @UsePipes(CreateOrUpdateParentPipe)
  async updateCategory(
    @Param('id') id: string,
    @Body() body: CreateOrUpdateCategoryDto,
    @Res() res: Response,
  ) {
    try {
      await this.service.updateCategory({ ...body, id: id });
      return res.status(HttpStatus.OK).json({
        success: true,
        data: null,
        message: 'Category updated',
      });
    } catch (error) {
      return res.status(error.status || HttpStatus.UNAUTHORIZED).json({
        success: false,
        data: null,
        message: error.message || 'Error updating category',
      });
    }
  }

  @Delete('parent/:id')
  async deleteCategory(@Param('id') id: string, @Res() res: Response) {
    try {
      await this.service.deleteCategory(id);
      return res.status(HttpStatus.OK).json({
        success: true,
        data: null,
        message: 'Category deleted',
      });
    } catch (error) {
      return res.status(error.status || HttpStatus.UNAUTHORIZED).json({
        success: false,
        data: null,
        message: error.message || 'Error deleting category',
      });
    }
  }

  // --------------------------------------------------------------------------------
  // Categories Values
  // --------------------------------------------------------------------------------

  @Get('values/:parentCategoryId')
  async getCategoryValuesGrouped(
    @Param('parentCategoryId') parentCategoryId: string,
    @Res() res: Response,
  ) {
    try {
      const categoryValues =
        await this.service.getCategoryValuesGrouped(parentCategoryId);
      return res.status(HttpStatus.OK).json({
        success: true,
        data: categoryValues,
        message: 'Category values fetched',
      });
    } catch (error) {
      return res.status(error.status || HttpStatus.UNAUTHORIZED).json({
        success: false,
        data: null,
        message: error.message || 'Error getting category values',
      });
    }
  }

  @Post('values')
  @UsePipes(CreateOrUpdateCategoryValuePipe)
  async createCategoryValue(
    @Body() body: CreateOrUpdateCategoryValueDto,
    @Res() res: Response,
  ) {
    try {
      await this.service.createCategoryValue(body);
      return res.status(HttpStatus.OK).json({
        success: true,
        data: null,
        message: 'Category value created',
      });
    } catch (error) {
      return res.status(error.status || HttpStatus.UNAUTHORIZED).json({
        success: false,
        data: null,
        message: error.message || 'Error creating category value',
      });
    }
  }

  @Put('values/:id')
  @UsePipes(CreateOrUpdateCategoryValuePipe)
  async updateCategoryValue(
    @Param('id') id: string,
    @Body() body: CreateOrUpdateCategoryValueDto,
    @Res() res: Response,
  ) {
    try {
      await this.service.updateCategoryValue({ ...body, id: id });
      return res.status(HttpStatus.OK).json({
        success: true,
        data: null,
        message: 'Category value updated',
      });
    } catch (error) {
      return res.status(error.status || HttpStatus.UNAUTHORIZED).json({
        success: false,
        data: null,
        message: error.message || 'Error updating category value',
      });
    }
  }

  @Delete('values/:id')
  async deleteCategoryValue(@Param('id') id: string, @Res() res: Response) {
    try {
      await this.service.deleteCategoryValue(id);
      return res.status(HttpStatus.OK).json({
        success: true,
        data: null,
        message: 'Category value deleted',
      });
    } catch (error) {
      return res.status(error.status || HttpStatus.UNAUTHORIZED).json({
        success: false,
        data: null,
        message: error.message || 'Error deleting category value',
      });
    }
  }
}
