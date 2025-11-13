import { Transform } from 'class-transformer';
import {
  IsBoolean,
  IsOptional,
  IsString,
  IsUUID,
  Length,
} from 'class-validator';

export class CreateOrUpdateCategoryDto {
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

  @IsUUID('4', { message: 'productTypeId must be a valid UUID (v4)' })
  productTypeId: string;

  @IsOptional()
  @IsBoolean()
  grouper: boolean;
}
