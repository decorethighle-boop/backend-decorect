// src/modules/categories/controllers/categories.controller.ts
import { Controller } from '@nestjs/common';
import { CategoriesDbService } from '../services/categories-db.service';
import { CategoriesService } from '../services/categories.service';

@Controller('categories')
export class CategoriesController {
  constructor(
    private readonly service: CategoriesService,
    private readonly db: CategoriesDbService,
  ) {
    // --------------------------------------------------------------------------------
    // Categories
    // --------------------------------------------------------------------------------
  }
}
