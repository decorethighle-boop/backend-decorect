// src/modules/products/dtos/create-product.dto.ts
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
} from 'class-validator';
import { ProductType } from '../entities/product.entity';
import { CreateProductColorDto } from './create-product-color.dto';

export class CreateProductDto {
  @IsString()
  @MaxLength(180)
  name: string;

  @IsEnum(ProductType)
  type: ProductType;

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

  @Length(2, 2)
  countryOfOrigin: string; // send in uppercase from the client

  @IsArray()
  @ArrayNotEmpty()
  @IsUUID('4', { each: true })
  subcategoryIds: string[]; // just IDs of subcategories (children)

  @IsOptional()
  @IsArray()
  colorOptions?: CreateProductColorDto[];
}
