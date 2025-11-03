// src/modules/products/dtos/update-product.dto.ts
import { Type } from 'class-transformer';
import {
  ArrayNotEmpty,
  IsArray,
  IsEnum,
  IsOptional,
  IsString,
  IsUrl,
  IsUUID,
  Length,
  MaxLength,
  ValidateNested,
} from 'class-validator';
import { ProductType } from '../entities/product.entity';
import { CreateProductColorDto } from './create-product-color.dto';

export class UpdateProductDto {
  @IsOptional()
  @IsString()
  @MaxLength(180)
  name?: string;

  @IsOptional()
  @IsEnum(ProductType)
  type?: ProductType;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsUrl()
  @MaxLength(2048)
  mainImageUrl?: string;

  @IsOptional()
  @IsUrl()
  @MaxLength(2048)
  presentationImageUrl?: string;

  @IsOptional()
  @Length(2, 2)
  countryOfOrigin?: string;

  @IsOptional()
  @IsArray()
  @ArrayNotEmpty()
  @IsUUID('4', { each: true })
  subcategoryIds?: string[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateProductColorDto)
  colorOptions?: CreateProductColorDto[];
}
