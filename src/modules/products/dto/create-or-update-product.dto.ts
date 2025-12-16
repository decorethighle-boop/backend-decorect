import { Transform, Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  IsUUID,
  Length,
  ValidateNested,
} from 'class-validator';

export class CreateOrUpdateProductDto {
  @IsUUID('4', { message: 'id must be a valid UUID (v4)' })
  id: string;

  @IsString({ message: 'name must be a string' })
  @Length(1, 120, { message: 'name must be between 1 and 120 characters long' })
  @Transform(({ value }) => {
    if (typeof value !== 'string') return value;
    value = value.trim().toLowerCase();
    return value.charAt(0).toUpperCase() + value.slice(1);
  })
  name: string;

  @IsUUID('4', { message: 'id must be a valid UUID (v4)' })
  productTypeId: string;

  @IsString({ message: 'description must be a string' })
  @Length(10, 2000, {
    message: 'description must be between 10 and 2000 characters long',
  })
  @Transform(({ value }) => {
    if (typeof value !== 'string') return value;
    return value.trim();
  })
  description: string;

  @IsUUID('4', { message: 'id must be a valid UUID (v4)' })
  productionCountryId: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => VariantCategoriesDto)
  categories: VariantCategoriesDto[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => GeneratedVariantDto)
  variants: GeneratedVariantDto[];
}

class VariantCategoryValueImagesDto {
  @IsString()
  @IsNotEmpty()
  main_photo: string;

  @IsArray()
  @IsString({ each: true })
  gallery: string[];
}

export class VariantCategoryValueDto {
  @IsString()
  @IsNotEmpty()
  category_value_id: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => VariantCategoryValueImagesDto)
  images?: VariantCategoryValueImagesDto;

  @IsOptional()
  @IsObject()
  rules?: Record<string, string[]>;
}

export class VariantCategoriesDto {
  @IsString()
  @IsNotEmpty()
  category_id: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsBoolean()
  canSelect: boolean;

  @IsOptional()
  @IsBoolean()
  grouper?: boolean;

  @IsOptional()
  @IsBoolean()
  depends_on?: boolean;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => VariantCategoryValueDto)
  values: VariantCategoryValueDto[];
}

export class GenearatedVariantCategoryValueDto {
  @IsString()
  categoryValueId: string;

  @IsString()
  name: string;
}

export class GeneratedVariantValueDto {
  @IsString()
  categoryId: string;

  @IsString()
  categoryName: string;

  @IsString()
  valueId: string;

  @IsString()
  valueName: string;
}

export class GeneratedVariantDto {
  @IsString()
  name: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => GeneratedVariantValueDto)
  values: GeneratedVariantValueDto[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => GenearatedVariantCategoryValueDto)
  categories: GenearatedVariantCategoryValueDto[];
}
