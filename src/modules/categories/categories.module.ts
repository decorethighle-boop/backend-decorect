// src/modules/categories/categories.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CategoriesController } from './controllers/categories.controller';
import { CategoryValue } from './entities/category-value.entity';
import { Category } from './entities/category.entity';
import { CategoriesDbService } from './services/categories-db.service';
import { CategoriesService } from './services/categories.service';

@Module({
  imports: [TypeOrmModule.forFeature([Category, CategoryValue])],
  controllers: [CategoriesController],
  providers: [CategoriesDbService, CategoriesService],
  exports: [CategoriesDbService],
})
export class CategoriesModule {}
