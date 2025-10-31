// src/modules/categories/dto/update-category.dto.ts
import { OmitType, PartialType } from '@nestjs/mapped-types';
import { IsOptional, IsUUID, Matches, ValidateIf } from 'class-validator';
import { CreateCategoryDto } from './create-category.dto';

export class UpdateCategoryDto extends PartialType(
  OmitType(CreateCategoryDto, ['parentId'] as const),
) {
  @IsOptional()
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
  slug?: string;

  @IsOptional()
  @ValidateIf((_, v) => v !== null && v !== undefined)
  @IsUUID()
  parentId?: string | null;
}
