import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SuppliersController } from './controllers/suppliers.controller';
import { Supplier } from './entity/supplier.entity';
import { SuppliersDbService } from './services/suppliers-db.service';
import { SuppliersService } from './services/suppliers.service';

@Module({
  imports: [TypeOrmModule.forFeature([Supplier])],
  controllers: [SuppliersController],
  providers: [SuppliersDbService, SuppliersService],
  exports: [SuppliersDbService],
})
export class SuppliersModule {}
