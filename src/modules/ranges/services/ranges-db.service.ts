import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
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
      relations: ['groups'],
    });
  }

  async createRange(rangeDto: CreateOrUpdateProductsRangeDto) {
    let groups = <RangeGroup[]>[];

    if (rangeDto.groupIds?.length) {
      groups = await this.rangeGroupsRepository.findBy({
        id: In(rangeDto.groupIds),
      });

      if (groups.length !== rangeDto.groupIds.length) {
        throw new Error('Some RangeGroup IDs were not found');
      }
    }

    const range = this.rangesRepository.create({
      ...rangeDto,
      groups,
    });

    await this.rangesRepository.save(range);

    return range;
  }

  async updateRange(rangeDto: CreateOrUpdateProductsRangeDto) {
    const existingRange = await this.rangesRepository.findOne({
      where: { id: rangeDto.id },
      relations: ['groups'],
    });

    if (!existingRange) {
      throw new Error(`Rangenot found`);
    }

    let groups: RangeGroup[] = [];
    if (rangeDto.groupIds?.length) {
      groups = await this.rangeGroupsRepository.findBy({
        id: In(rangeDto.groupIds),
      });

      if (groups.length !== rangeDto.groupIds.length) {
        throw new Error('Some RangeGroup IDs were not found');
      }
    }

    Object.assign(existingRange, rangeDto);
    existingRange.groups = groups;

    await this.rangesRepository.save(existingRange);

    return existingRange;
  }

  async deleteRange(id: string) {
    await this.rangesRepository.delete(id);
  }
}
