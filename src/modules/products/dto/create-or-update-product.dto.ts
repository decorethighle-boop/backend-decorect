import { Transform, Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsOptional,
  IsString,
  IsUrl,
  IsUUID,
  Length,
  ValidateNested,
} from 'class-validator';
import { CreateOrUpdateColorProductImageDto } from './create-or-update-color-product-imate.dto';

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

  @IsUrl({}, { message: 'mainPhoto must be a valid URL' })
  mainPhoto: string;

  @IsArray({ message: 'presentationPhotos must be an array' })
  @ArrayMinSize(1, { message: 'presentationPhotos must have at least 1 item' })
  @IsUrl(
    {},
    { each: true, message: 'Each presentationPhoto must be a valid URL' },
  )
  presentationPhotos: string[];

  @IsString({ message: 'description must be a string' })
  @Length(10, 2000, {
    message: 'description must be between 10 and 2000 characters long',
  })
  @Transform(({ value }) => {
    if (typeof value !== 'string') return value;
    return value.trim();
  })
  description: string;

  @IsOptional()
  @IsArray({ message: 'subCategories must be an array' })
  @ArrayMinSize(1, { message: 'subCategories must have at least 1 item' })
  @IsUUID('4', { each: true, message: 'Each subCategory must be a valid UUID' })
  subCategories: string[];

  @IsArray({ message: 'colorImages must be an array' })
  @ValidateNested({ each: true })
  @Type(() => CreateOrUpdateColorProductImageDto)
  colorImages: CreateOrUpdateColorProductImageDto[];

  @IsBoolean({ message: 'rectified must be a boolean' })
  rectified: boolean;

  @IsBoolean({ message: 'antiSlip must be a boolean' })
  antiSlip: boolean;

  @IsString({ message: 'productionCountry must be a string' })
  @Length(2, 60, {
    message: 'productionCountry must be between 2 and 60 characters long',
  })
  @Transform(({ value }) => {
    if (typeof value !== 'string') return value;
    return value.trim().toUpperCase();
  })
  productionCountry: string;
}
