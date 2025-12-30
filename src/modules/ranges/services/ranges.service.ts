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

const WITHOUT_GROUP_ID = 'without-group';
const WITHOUT_GROUP_NAME = 'Ungrouped';

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

  async getRanges({ page = 1, search, all }: FilterRanges, token: any) {
    const limit = 10;
    const skip = (page - 1) * limit;

    const includeEmptyGroups = token?.parentRole?.hierarchy === 2 && all;

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
   Caso sin search: comportamiento actual + grupo "without group"
   --------------------------- */
  private async getRangesByGroups(
    limit: number,
    skip: number,
    includeEmptyGroups: boolean = false,
  ): Promise<{ data: RangeGroupResponse[]; total: number }> {
    const groupsQB = this.db.getRangeGroupsQueryBuilder();

    // Si NO se incluyen grupos vacíos, filtrar solo los que tengan ranges
    if (!includeEmptyGroups) {
      // Usamos la tabla pivote (range_group_ranges) para saber si existen ranges asociados
      groupsQB.where(
        `EXISTS (SELECT 1 FROM range_group_ranges rgr WHERE rgr.group_id = range_groups.id)`,
      );
    }

    // Obtener conteo de grupos (solo los reales de DB)
    const dbGroupsTotal = await groupsQB.getCount();

    // Obtener página de grupos desde la DB (paginación DB)
    const groups = await groupsQB
      .orderBy('range_groups.name', 'ASC')
      .take(limit)
      .skip(skip)
      .getMany();

    if (!groups.length) {
      // Aún así puede haber ranges sin grupo => devolver solo grupo sintético si existe
      const ungroupedRanges = await this.fetchUngroupedRanges();
      if (ungroupedRanges.length) {
        const withoutGroup: RangeGroupResponse = {
          id: WITHOUT_GROUP_ID,
          name: WITHOUT_GROUP_NAME,
          ranges: ungroupedRanges.map(r => ({
            id: r.id,
            name: r.name,
            imageBanner: r.imageBanner,
          })),
        };
        // total será 1 (solo el grupo sintético)
        return { data: [withoutGroup], total: 1 };
      }

      return { data: [], total: 0 };
    }

    const groupIds = groups.map(g => g.id);

    // Traer ranges que pertenezcan a estos groupIds
    const ranges = await this.fetchRangesByGroupIds(groupIds);

    // Agrupar ranges por groupId y también guardar los sin grupo bajo WITHOUT_GROUP_ID
    const rangesByGroup = this.groupRangesByGroupId(ranges);

    // Mapear grupos reales
    const dataForDbGroups: RangeGroupResponse[] = groups.map(g => ({
      id: g.id,
      name: g.name,
      ranges: rangesByGroup[g.id] ?? [],
    }));

    // Si estamos en la primera página (skip === 0) añadimos el grupo sintético al resultado (si tiene ranges)
    let finalData = dataForDbGroups;
    let total = dbGroupsTotal;

    if (skip === 0) {
      const ungroupedRanges = await this.fetchUngroupedRanges();
      if (ungroupedRanges.length) {
        const withoutGroup: RangeGroupResponse = {
          id: WITHOUT_GROUP_ID,
          name: WITHOUT_GROUP_NAME,
          ranges: ungroupedRanges.map(r => ({
            id: r.id,
            name: r.name,
            imageBanner: r.imageBanner,
            variantsCount: r.variants?.length || 0,
          })),
        };

        // Añadir al final (puedes cambiar el orden si prefieres que vaya al inicio)
        finalData = [...dataForDbGroups, withoutGroup];

        // Ajustar total para incluir el grupo sintético
        total = dbGroupsTotal + 1;
      }
    }

    // Si includeEmptyGroups === false, filtrar grupos sin ranges (sólo en la data real, ya hemos aplicado DB filter)
    const outputData = includeEmptyGroups
      ? finalData
      : finalData.filter(g => g.ranges.length > 0);

    return {
      data: outputData,
      total,
    };
  }

  private async fetchRangesByGroupIds(
    groupIds: string[],
  ): Promise<ProductsRange[]> {
    if (!groupIds?.length) return [];

    // Unimos la relación many-to-many (unidireccional) desde ranges -> groups
    return this.db
      .getRangesQueryBuilder()
      .leftJoinAndSelect('ranges.groups', 'group')
      .where('group.id IN (:...groupIds)', { groupIds })
      .getMany();
  }

  // Obtener ranges sin grupo (para el grupo sintético)
  private async fetchUngroupedRanges(): Promise<ProductsRange[]> {
    // Ranges que NO tienen asociación en la tabla pivote -> group.id IS NULL tras leftJoin
    return this.db
      .getRangesQueryBuilder()
      .leftJoinAndSelect('ranges.groups', 'group')
      .where('group.id IS NULL')
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
    // Paso 1 — Buscar ranges que coincidan por nombre (y traer sus grupos)
    const matchingRanges = await this.db
      .getRangesQueryBuilder()
      .leftJoinAndSelect('ranges.groups', 'group')
      .where('ranges.name ILIKE :search', { search: `%${search}%` })
      .getMany();

    if (!matchingRanges.length) {
      return { data: [], total: 0 };
    }

    // Agrupar ranges por groupId (incluye sin grupo bajo WITHOUT_GROUP_ID)
    const rangesByGroup = this.groupRangesByGroupId(matchingRanges);

    // Todos los groupIds reales encontrados
    const realGroupIds = Object.keys(rangesByGroup).filter(
      id => id !== WITHOUT_GROUP_ID,
    );

    // Paso 2 — Obtener los grupos a los que pertenecen (solo los reales)
    let groupsQuery = this.db
      .getRangeGroupsQueryBuilder()
      .where('range_groups.id IN (:...groupIds)', {
        groupIds: realGroupIds.length ? realGroupIds : ['__NONE__'],
      })
      .orderBy('range_groups.name', 'ASC');

    // Cantidad de grupos reales
    const dbGroupsTotal = realGroupIds.length
      ? await groupsQuery.getCount()
      : 0;

    const groups = await groupsQuery.take(limit).skip(skip).getMany();

    const dataForDbGroups: RangeGroupResponse[] = groups.map(g => ({
      id: g.id,
      name: g.name,
      ranges: rangesByGroup[g.id] ?? [],
    }));

    // Si estamos en la primera página, añadir grupo sintético si hay ranges sin grupo
    let finalData = dataForDbGroups;
    let total = dbGroupsTotal;

    if (skip === 0 && rangesByGroup[WITHOUT_GROUP_ID]?.length) {
      const withoutGroup: RangeGroupResponse = {
        id: WITHOUT_GROUP_ID,
        name: WITHOUT_GROUP_NAME,
        ranges: rangesByGroup[WITHOUT_GROUP_ID],
      };

      finalData = [...dataForDbGroups, withoutGroup];
      total = dbGroupsTotal + 1;
    }

    return {
      data: finalData,
      total,
    };
  }

  /* ---------------------------
   Helper: agrupa un array de ranges por groupId y devuelve RangeResponse[]
   --------------------------- */
  private groupRangesByGroupId(
    ranges: ProductsRange[],
  ): Record<string, RangeResponse[]> {
    return ranges.reduce(
      (acc, r) => {
        // Si el range no tiene groups (o vacíos), lo agregamos al grupo sintético
        if (!r.groups || !r.groups.length) {
          if (!acc[WITHOUT_GROUP_ID]) acc[WITHOUT_GROUP_ID] = [];
          acc[WITHOUT_GROUP_ID].push({
            id: r.id,
            name: r.name,
            imageBanner: r.imageBanner,
            variantsCount: r.variants?.length || 0,
          });
          return acc;
        }

        // Si tiene varios grupos, agregamos una entrada por cada grupo
        for (const g of r.groups) {
          if (!g?.id) continue;
          if (!acc[g.id]) acc[g.id] = [];
          acc[g.id].push({
            id: r.id,
            name: r.name,
            imageBanner: r.imageBanner,
            variantsCount: r.variants?.length || 0,
          });
        }

        return acc;
      },
      {} as Record<string, RangeResponse[]>,
    );
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
