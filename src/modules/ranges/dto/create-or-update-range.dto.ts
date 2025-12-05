import { Type } from 'class-transformer';
import {
  IsArray,
  IsOptional,
  IsString,
  IsUUID,
  Length,
  ValidateNested,
} from 'class-validator';

export class ProductRangeVariantDto {
  @IsUUID()
  productId: string;

  @IsString()
  @Length(1, 150)
  productName: string;

  @IsString()
  @Length(1, 150)
  variantName: string;

  @IsString()
  mainPhoto: string;

  @IsArray()
  @IsString({ each: true })
  selectedCategoryValueIds: string[];
}

export class CreateOrUpdateProductsRangeDto {
  @IsUUID()
  id: string;

  @IsString()
  @Length(1, 150)
  name: string;

  @IsString()
  imageBanner: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  images?: string[];

  @IsString()
  description: string;

  @IsUUID()
  groupId: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProductRangeVariantDto)
  variants: ProductRangeVariantDto[];
}
