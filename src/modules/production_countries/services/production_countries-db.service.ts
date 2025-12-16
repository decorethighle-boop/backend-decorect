import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateOrUpdateProductionCountryDto } from '../dto/create_or_edit_production_country.dto';
import { ProductionCountry } from '../entities/production-country.entity';

@Injectable()
export class ProductionCountryDbService {
  constructor(
    @InjectRepository(ProductionCountry)
    private readonly productionCountriesRepository: Repository<ProductionCountry>,
  ) {}

  async getProductionCountries() {
    return this.productionCountriesRepository.createQueryBuilder(
      'productionCountry',
    );
  }

  async createProductionCountry(body: CreateOrUpdateProductionCountryDto) {
    const productionCountry = this.productionCountriesRepository.create({
      id: body.id,
      name: body.name,
      code: body.code,
    });
    await this.productionCountriesRepository.save(productionCountry);
  }

  async updateProductionCountry(body: CreateOrUpdateProductionCountryDto) {
    const productionCountry = await this.productionCountriesRepository.findOne({
      where: { id: body.id },
    });
    if (!productionCountry)
      throw new NotFoundException(`ProductionCountry not found`);
    productionCountry.name = body.name;
    productionCountry.code = body.code ?? null;
    await this.productionCountriesRepository.save(productionCountry);
  }

  async deleteProductionCountry(id: string) {
    const productionCountry = await this.productionCountriesRepository.findOne({
      where: { id },
    });
    if (!productionCountry)
      throw new NotFoundException(`ProductionCountry not found`);
    await this.productionCountriesRepository.remove(productionCountry);
  }
}
