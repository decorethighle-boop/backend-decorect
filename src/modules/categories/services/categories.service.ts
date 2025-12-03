import { Injectable } from '@nestjs/common';
import { CreateOrUpdateCategoryValueDto } from '../dto/create-or-update-category-value.dto';
import { CreateOrUpdateCategoryDto } from '../dto/create-or-update-category.dto';
import { Category } from '../entities/category.entity';
import { FilterCategories } from '../types/filter-categories.type';
import { CategoriesDbService } from './categories-db.service';

@Injectable()
export class CategoriesService {
  constructor(private readonly db: CategoriesDbService) {}

  // --------------------------------------------------------------------------------
  // Categories
  // --------------------------------------------------------------------------------

  async getCategories({ page = 1, search, productTypeId }: FilterCategories) {
    const limit = 18;
    const skip = (page - 1) * limit;

    const query = await this.db.getCategoriesQueryBuilder(productTypeId);

    if (search) {
      query.andWhere('LOWER(category.name) LIKE LOWER(:search)', {
        search: `%${search}%`,
      });
    }

    query.take(limit).skip(skip);
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
    await this.db.createCategory(body);
  }

  async updateCategory(body: CreateOrUpdateCategoryDto) {
    await this.db.updateCategory(body);
  }

  async deleteCategory(id: string) {
    await this.db.deleteCategory(id);
  }

  // --------------------------------------------------------------------------------
  // Categories Values
  // --------------------------------------------------------------------------------

  async getCategoryValuesGrouped(productTypeId: string, user: any, all = true) {
    const categoryValues = await this.db.getCategoryValuesGrouped(
      productTypeId,
      user,
      all,
    );

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
      {} as Record<
        string,
        { parentCategory: Category; values: { id: string; name: string }[] }
      >,
    );

    if (user?.parentRole.hierarchy === 2) {
      const allCategoriesQuery =
        await this.db.getCategoriesQueryBuilder(productTypeId);
      const categories = await allCategoriesQuery.getMany();

      categories.forEach(cat => {
        if (!grouped[cat.id]) {
          grouped[cat.id] = {
            parentCategory: cat,
            values: [],
          };
        }
      });
    }

    return Object.values(grouped);
  }

  async createCategoryValue(body: CreateOrUpdateCategoryValueDto) {
    await this.db.createCategoryValue(body);
  }

  async updateCategoryValue(body: CreateOrUpdateCategoryValueDto) {
    await this.db.updateCategoryValue(body);
  }

  async deleteCategoryValue(id: string) {
    await this.db.deleteCategoryValue(id);
  }
}
