import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductionCountriesController } from './controllers/production_countries.controller';
import { ProductionCountry } from './entities/production-country.entity';
import { ProductionCountryDbService } from './services/production_countries-db.service';
import { ProductionCountryService } from './services/production_countries.service';

@Module({
  imports: [TypeOrmModule.forFeature([ProductionCountry])],
  controllers: [ProductionCountriesController],
  providers: [ProductionCountryDbService, ProductionCountryService],
  exports: [ProductionCountryDbService],
})
export class ProductionCountriesModule {}
