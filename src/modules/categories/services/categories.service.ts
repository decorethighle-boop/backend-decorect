import { Injectable } from '@nestjs/common';
import { CreateOrUpdateCategoryValueDto } from '../dto/create-or-update-category-value.dto';
import { CreateOrUpdateCategoryDto } from '../dto/create-or-update-category.dto';
import { FilterCategories } from '../types/filter-categories.type';
import { CategoriesDbService } from './categories-db.service';

@Injectable()
export class CategoriesService {
  constructor(private readonly db: CategoriesDbService) {}

  async onModuleInit() {
    await this.db.ensureDefaultCategories();
  }

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
    this.db.createCategory(body);
  }

  async updateCategory(body: CreateOrUpdateCategoryDto) {
    this.db.updateCategory(body);
  }

  async deleteCategory(id: string) {
    this.db.deleteCategory(id);
  }

  // --------------------------------------------------------------------------------
  // Categories Values
  // --------------------------------------------------------------------------------

  async getCategoryValuesGrouped(productTypeId: string) {
    const categoryValues =
      await this.db.getCategoryValuesGrouped(productTypeId);

    const grouped = categoryValues.reduce(
      (acc, cv) => {
        const parentId = cv.parentCategory.id;
        if (!acc[parentId]) {
          acc[parentId] = {
            parentCategory: cv.parentCategory,
            values: [],
          };
        }
        acc[parentId].values.push({
          id: cv.id,
          name: cv.name,
        });
        return acc;
      },
      {} as Record<string, any>,
    );

    return Object.values(grouped);
  }

  async createCategoryValue(body: CreateOrUpdateCategoryValueDto) {
    this.db.createCategoryValue(body);
  }

  async updateCategoryValue(body: CreateOrUpdateCategoryValueDto) {
    this.db.updateCategoryValue(body);
  }

  async deleteCategoryValue(id: string) {
    this.db.deleteCategoryValue(id);
  }
}
