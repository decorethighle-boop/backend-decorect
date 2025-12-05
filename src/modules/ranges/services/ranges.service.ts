import { Injectable } from '@nestjs/common';
import { CreateOrUpdateProductsRangeDto } from '../dto/create-or-update-range.dto';
import { CreateOrUpdateRangeGroupDto } from '../dto/create-or-update-reange-group.dto';
import {
  ProductsRange,
  RangeGroupResponse,
  RangeResponse,
} from '../entities/range.entity';
import { FilterRangeGroups } from '../types/filter-range-groups';
import { FilterRanges } from '../types/filter-ranges';
import { RangesDbService } from './ranges-db.service';

@Injectable()
export class RangesService {
  constructor(private readonly db: RangesDbService) {}

  //------------------------------------------------------------------------------
  // Range Groups
  //------------------------------------------------------------------------------

  async getRangeGroups({ page = 1, search }: FilterRangeGroups) {
    const limit = 15;
    const skip = (page - 1) * limit;

    const query = await this.db.getRangeGroupsQueryBuilder();

    if (search) {
      query.andWhere('range_groups.name ILIKE :search', {
        search: `%${search}%`,
      });
    }

    query.take(limit).skip(skip);

    const [groups, total] = await query.getManyAndCount();

    return {
      rangeGroups: groups,
      metadata: {
        total: total,
        page,
        lastPage: Math.ceil(total / limit),
        hasNextPage: page * limit < total,
      },
    };
  }

  async createRangeGroup(rangeGroup: CreateOrUpdateRangeGroupDto) {
    await this.db.createRangeGroup(rangeGroup);
  }

  async updateRangeGroup(rangeGroup: CreateOrUpdateRangeGroupDto) {
    await this.db.updateRangeGroup(rangeGroup);
  }

  async deleteRangeGroup(id: string) {
    await this.db.deleteRangeGroup(id);
  }

  //------------------------------------------------------------------------------
  // Ranges
  //------------------------------------------------------------------------------

  async getRanges({ page = 1, search, all = false }: FilterRanges, token: any) {
    const limit = 10;
    const skip = (page - 1) * limit;

    // Determinar si debemos incluir grupos sin rangos
    // const includeEmptyGroups = token?.parentRole?.hierarchy === 2 && all;
    const includeEmptyGroups = true;

    let result: RangeGroupResponse[];
    let total: number;

    if (search && search.trim() !== '') {
      const searchResult = await this.getRangesBySearch(
        search.trim(),
        limit,
        skip,
        includeEmptyGroups,
      );
      result = searchResult.data;
      total = searchResult.total;
    } else {
      const groupsResult = await this.getRangesByGroups(
        limit,
        skip,
        includeEmptyGroups,
      );
      result = groupsResult.data;
      total = groupsResult.total;
    }

    return {
      rangeGroups: result,
      metadata: {
        total: total,
        page,
        lastPage: Math.ceil(total / limit),
        hasNextPage: page * limit < total,
      },
    };
  }

  /* ---------------------------
   Caso sin search: comportamiento actual
   --------------------------- */
  private async getRangesByGroups(
    limit: number,
    skip: number,
    includeEmptyGroups: boolean = false,
  ): Promise<{ data: RangeGroupResponse[]; total: number }> {
    const groupsQB = this.db.getRangeGroupsQueryBuilder();

    // Si NO se incluyen grupos vacíos, filtrar solo los que tengan ranges
    if (!includeEmptyGroups) {
      const subQuery = this.db
        .getRangesQueryBuilder()
        .select('DISTINCT ranges.group_id');

      groupsQB.where(`range_groups.id IN (${subQuery.getQuery()})`);
    }

    const total = await groupsQB.getCount();

    const groups = await groupsQB
      .orderBy('range_groups.name', 'ASC')
      .take(limit)
      .skip(skip)
      .getMany();

    if (!groups.length) {
      return { data: [], total: 0 };
    }

    const groupIds = groups.map(g => g.id);
    const ranges = await this.fetchRangesByGroupIds(groupIds);

    const rangesByGroup = this.groupRangesByGroupId(ranges);

    const data = groups.map(g => ({
      id: g.id,
      name: g.name,
      ranges: rangesByGroup[g.id] ?? [],
    }));

    return {
      data: includeEmptyGroups ? data : data.filter(g => g.ranges.length > 0),
      total,
    };
  }

  private async fetchRangesByGroupIds(
    groupIds: string[],
  ): Promise<ProductsRange[]> {
    if (!groupIds?.length) return [];

    return this.db
      .getRangesQueryBuilder()
      .leftJoinAndSelect('ranges.group', 'group')
      .where('ranges.group_id IN (:...groupIds)', { groupIds })
      .getMany();
  }

  /* ---------------------------
   Caso con search: buscar ranges por nombre, paginados, agrupar por grupo
   --------------------------- */
  private async getRangesBySearch(
    search: string,
    limit: number,
    skip: number,
    includeEmptyGroups: boolean = false,
  ): Promise<{ data: RangeGroupResponse[]; total: number }> {
    // Paso 1 — Buscar ranges que coincidan por nombre
    const matchingRanges = await this.db
      .getRangesQueryBuilder()
      .leftJoinAndSelect('ranges.group', 'group')
      .where('ranges.name ILIKE :search', { search: `%${search}%` })
      .getMany();

    if (!matchingRanges.length) {
      return { data: [], total: 0 };
    }

    // Agrupar ranges por groupId
    const rangesByGroup = this.groupRangesByGroupId(matchingRanges);

    const groupIds = Object.keys(rangesByGroup);

    // Paso 2 — Obtener los grupos a los que pertenecen
    let groupsQuery = this.db
      .getRangeGroupsQueryBuilder()
      .where('range_groups.id IN (:...groupIds)', { groupIds })
      .orderBy('range_groups.name', 'ASC');

    const total = await groupsQuery.getCount();

    const groups = await groupsQuery.take(limit).skip(skip).getMany();

    const data = groups.map(g => ({
      id: g.id,
      name: g.name,
      ranges: rangesByGroup[g.id] ?? [],
    }));

    return {
      data,
      total,
    };
  }

  /* ---------------------------
   Helper: agrupa un array de ranges por groupId y devuelve RangeResponse[]
   --------------------------- */
  private groupRangesByGroupId(
    ranges: ProductsRange[],
  ): Record<string, RangeResponse[]> {
    return ranges.reduce((acc, r) => {
      const gid = r.group?.id;
      if (!gid) return acc;

      if (!acc[gid]) acc[gid] = [];

      acc[gid].push({
        id: r.id,
        name: r.name,
        imageBanner: r.imageBanner,
      });

      return acc;
    }, {});
  }

  async getRangeById(id: string) {
    return this.db.getRangeById(id);
  }

  async createRange(range: CreateOrUpdateProductsRangeDto) {
    await this.db.createRange(range);
  }

  async updateRange(range: CreateOrUpdateProductsRangeDto) {
    await this.db.updateRange(range);
  }

  async deleteRange(id: string) {
    await this.db.deleteRange(id);
  }
}
