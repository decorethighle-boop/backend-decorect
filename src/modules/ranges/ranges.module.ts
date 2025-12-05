import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RangesController } from './controllers/ranges.controller';
import { ProductsRange } from './entities/range.entity';
import { RangeGroup } from './entities/ranges-group.entity';
import { RangesDbService } from './services/ranges-db.service';
import { RangesService } from './services/ranges.service';

@Module({
  imports: [TypeOrmModule.forFeature([RangeGroup, ProductsRange])],
  controllers: [RangesController],
  providers: [RangesDbService, RangesService],
})
export class RangesModule {}
