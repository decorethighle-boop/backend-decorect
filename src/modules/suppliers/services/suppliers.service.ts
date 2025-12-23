import { Injectable } from '@nestjs/common';
import { CreateOrUpdateSupplierDto } from '../dto/creater-or-update-supplier.dto';
import { FilterSuppliers } from '../types/filter-suppliers.type';
import { SuppliersDbService } from './suppliers-db.service';

@Injectable()
export class SuppliersService {
  constructor(private readonly db: SuppliersDbService) {}

  async getSuppliers({ page = 1, search }: FilterSuppliers) {
    const limit = 10;
    const skip = (page - 1) * limit;

    const query = await this.db.getSuppliers();

    if (search) {
      query.andWhere('(suppliers.name ILIKE :search)', {
        search: `%${search}%`,
      });
    }

    query.take(limit).skip(skip);

    const [suppliers, total] = await query.getManyAndCount();

    return {
      suppliers,
      metadata: {
        total,
        page,
        lastPage: Math.ceil(total / limit),
        hasNextPage: page * limit < total,
      },
    };
  }

  async createSupplier(body: CreateOrUpdateSupplierDto) {
    return await this.db.createSupplier(body);
  }

  async updateSupplier(body: CreateOrUpdateSupplierDto) {
    return await this.db.updateSupplier(body);
  }

  async deleteSupplier(id: string) {
    return await this.db.deleteSupplier(id);
  }
}
