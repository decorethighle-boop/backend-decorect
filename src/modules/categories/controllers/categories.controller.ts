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
import { CreateOrUpdateCategoryDto } from '../dto/create-or-update-category.dto';
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
        message: '',
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
        message: '',
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
        message: '',
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
        message: '',
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
}
