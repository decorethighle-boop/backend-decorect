// src/modules/categories/dto/create-category.dto.ts
import {
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  IsUrl,
  IsUUID,
  Matches,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateCategoryDto {
  @IsString()
  @MaxLength(120)
  name: string;

  @IsOptional()
  @IsString()
  @MaxLength(140)
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
  slug?: string; // si no viene, se genera desde name

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number;

  @IsOptional()
  @IsUrl()
  iconUrl?: string;

  @IsOptional()
  @IsUrl()
  imageUrl?: string;

  @IsOptional()
  @IsUUID()
  parentId?: string; // si viene → subcategoría
}
