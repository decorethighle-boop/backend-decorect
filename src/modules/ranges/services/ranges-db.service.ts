import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateOrUpdateProductsRangeDto } from '../dto/create-or-update-range.dto';
import { CreateOrUpdateRangeGroupDto } from '../dto/create-or-update-reange-group.dto';
import { ProductsRange } from '../entities/range.entity';
import { RangeGroup } from '../entities/ranges-group.entity';

@Injectable()
export class RangesDbService {
  constructor(
    @InjectRepository(ProductsRange)
    private readonly rangesRepository: Repository<ProductsRange>,

    @InjectRepository(RangeGroup)
    private readonly rangeGroupsRepository: Repository<RangeGroup>,
  ) {}

  //------------------------------------------------------------------------------
  // Range Groups
  //------------------------------------------------------------------------------

  getRangeGroupsQueryBuilder() {
    return this.rangeGroupsRepository.createQueryBuilder('range_groups');
  }

  async createRangeGroup(rangeGroup: CreateOrUpdateRangeGroupDto) {
    await this.rangeGroupsRepository.save(rangeGroup);
  }

  async updateRangeGroup(rangeGroup: CreateOrUpdateRangeGroupDto) {
    await this.rangeGroupsRepository.save(rangeGroup);
  }

  async deleteRangeGroup(id: string) {
    await this.rangeGroupsRepository.delete(id);
  }

  //------------------------------------------------------------------------------
  // Ranges
  //------------------------------------------------------------------------------

  getRangesQueryBuilder() {
    return this.rangesRepository.createQueryBuilder('ranges');
  }

  async getRangeById(id: string) {
    return this.rangesRepository.findOne({
      where: { id },
      relations: ['group'],
    });
  }

  async createRange(rangeDto: CreateOrUpdateProductsRangeDto) {
    const group = await this.rangeGroupsRepository.findOne({
      where: { id: rangeDto.groupId },
    });

    if (!group) {
      throw new Error('RangeGroup not found');
    }

    const range = this.rangesRepository.create({
      ...rangeDto,
      group,
    });

    await this.rangesRepository.save(range);
  }

  async updateRange(range: CreateOrUpdateProductsRangeDto) {
    await this.rangesRepository.save(range);
  }

  async deleteRange(id: string) {
    await this.rangesRepository.delete(id);
  }
}
