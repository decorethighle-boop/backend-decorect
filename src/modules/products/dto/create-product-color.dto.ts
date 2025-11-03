// src/modules/products/dtos/create-product-color.dto.ts
import {
  IsBoolean,
  IsOptional,
  IsString,
  IsUrl,
  Matches,
  MaxLength,
} from 'class-validator';

export class CreateProductColorDto {
  @IsString()
  @MaxLength(64)
  code: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  displayName?: string;

  @IsOptional()
  @Matches(/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/)
  hexCode?: string;

  @IsUrl()
  @MaxLength(2048)
  imageUrl: string;

  @IsOptional()
  @IsBoolean()
  isDefault?: boolean = false;
}
