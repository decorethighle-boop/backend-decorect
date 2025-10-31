// src/modules/categories/controllers/categories.controller.ts
import { Body, Controller, Get, Param, Post, Put } from '@nestjs/common';
import { CreateCategoryDto } from '../dto/create-category.dto';
import { UpdateCategoryDto } from '../dto/update-category.dto';
import { CategoriesDbService } from '../services/categories-db.service';
import { CategoriesService } from '../services/categories.service';

@Controller('categories')
export class CategoriesController {
  constructor(
    private readonly service: CategoriesService,
    private readonly db: CategoriesDbService,
  ) {}

  @Post()
  create(@Body() dto: CreateCategoryDto) {
    return this.service.create(dto);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdateCategoryDto) {
    return this.service.update(id, dto);
  }

  @Get('roots')
  roots() {
    return this.db.findRoots();
  }

  //just parents categories,without children
  @Get('parents')
  parents() {
    return this.db.findParentsOnly();
  }
  @Get(':parentId/children')
  children(@Param('parentId') parentId: string) {
    return this.db.findChildrenOf(parentId);
  }
}
