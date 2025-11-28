import { Type } from 'class-transformer';
import {
  IsArray,
  IsString,
  IsUUID,
  Length,
  ValidateNested,
} from 'class-validator';

export class WishlistProductVariantDto {
  @IsUUID('4', { message: 'productId must be a valid UUID (v4)' })
  productId: string;

  @IsString({ message: 'variantName must be a string' })
  @Length(1, 120, {
    message: 'variantName must be between 1 and 120 characters long',
  })
  variantName: string;

  @IsArray()
  selectedCategoryValueIds: string[];
}

export class CreateOrUpdateWishlistDto {
  @IsUUID('4', { message: 'id must be a valid UUID (v4)' })
  id: string;

  @IsString()
  @Length(1, 150)
  name: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => WishlistProductVariantDto)
  products: WishlistProductVariantDto[];
}
