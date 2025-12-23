import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateOrUpdateSupplierDto } from '../dto/creater-or-update-supplier.dto';
import { Supplier } from '../entity/supplier.entity';

@Injectable()
export class SuppliersDbService {
  constructor(
    @InjectRepository(Supplier)
    private readonly suppliersRepository: Repository<Supplier>,
  ) {}

  async getSuppliers() {
    return this.suppliersRepository.createQueryBuilder('suppliers');
  }

  async createSupplier(body: CreateOrUpdateSupplierDto) {
    const supplier = this.suppliersRepository.create(body);
    await this.suppliersRepository.save(supplier);
  }

  async updateSupplier(body: CreateOrUpdateSupplierDto) {
    const supplier = await this.suppliersRepository.findOne({
      where: { id: body.id },
    });
    if (!supplier) throw new Error(`Supplier not found`);
    supplier.name = body.name;
    await this.suppliersRepository.save(supplier);
  }

  async deleteSupplier(id: string) {
    const supplier = await this.suppliersRepository.findOne({
      where: { id },
    });
    if (!supplier) throw new Error(`Supplier not found`);
    await this.suppliersRepository.remove(supplier);
  }
}
