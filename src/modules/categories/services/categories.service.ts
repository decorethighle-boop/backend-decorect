import { Injectable } from '@nestjs/common';
import { CreateOrUpdateCategoryDto } from '../dto/create-or-update-category.dto';
import { FilterCategories } from '../types/filter-categories.type';
import { CategoriesDbService } from './categories-db.service';

@Injectable()
export class CategoriesService {
  constructor(private readonly db: CategoriesDbService) {}

  // --------------------------------------------------------------------------------
  // Categories
  // --------------------------------------------------------------------------------

  async getCategories({ page = 1, search }: FilterCategories) {
    const limit = 18;
    const skip = (page - 1) * limit;

    const query = await this.db.getCategoriesQueryBuilder();
    query.take(limit).skip(skip);

    if (search) {
      query.andWhere(`(category.name ILIKE :search)`, {
        search: `%${search}%`,
      });
    }

    const [categories, total] = await query.getManyAndCount();
    return {
      categories,
      metadata: {
        total,
        page,
        lastPage: Math.ceil(total / limit),
        hasNextPage: page * limit < total,
      },
    };
  }

  async createCategory(body: CreateOrUpdateCategoryDto) {
    return this.db.createCategory(body);
  }

  async updateCategory(body: CreateOrUpdateCategoryDto) {
    return this.db.updateCategory(body);
  }

  async deleteCategory(id: string) {
    return this.db.deleteCategory(id);
  }

  // --------------------------------------------------------------------------------
  // Categories Values
  // --------------------------------------------------------------------------------
}
