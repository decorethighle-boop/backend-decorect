import { Injectable } from '@nestjs/common';
import { CreateOrUpdateProductionCountryDto } from '../dto/create_or_edit_production_country.dto';
import { FilterProductionCountries } from '../types/filter-production-countries';
import { ProductionCountryDbService } from './production_countries-db.service';

@Injectable()
export class ProductionCountryService {
  constructor(private readonly db: ProductionCountryDbService) {}

  async getProductionCountries({
    page = 1,
    search,
  }: FilterProductionCountries) {
    const limit = 10;
    const skip = (page - 1) * limit;

    const query = await this.db.getProductionCountries();

    if (search) {
      query.andWhere(
        '(productionCountry.name ILIKE :search OR productionCountry.code ILIKE :search)',
        {
          search: `%${search}%`,
        },
      );
    }

    query.take(limit).skip(skip);

    const [productionCountries] = await query.getManyAndCount();

    return {
      productionCountries,
      metadata: {
        total: productionCountries.length,
        page,
        lastPage: Math.ceil(productionCountries.length / limit),
        hasNextPage: page * limit < productionCountries.length,
      },
    };
  }

  async createProductionCountry(body: CreateOrUpdateProductionCountryDto) {
    await this.db.createProductionCountry(body);
  }

  async updateProductionCountry(body: CreateOrUpdateProductionCountryDto) {
    await this.db.updateProductionCountry(body);
  }

  async deleteProductionCountry(id: string) {
    await this.db.deleteProductionCountry(id);
  }
}
