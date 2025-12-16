import { Transform } from 'class-transformer';
import { IsOptional, IsString, IsUUID, Length } from 'class-validator';

export class CreateOrUpdateProductionCountryDto {
  @IsUUID('4', { message: 'id must be a valid UUID (v4)' })
  id: string;

  @IsString({ message: 'name must be a string' })
  @Length(1, 30, { message: 'name must be between 1 and 30 characters long' })
  @Transform(({ value }) => {
    if (typeof value !== 'string') return value;
    value = value.trim().toLowerCase();
    return value.charAt(0).toUpperCase() + value.slice(1);
  })
  name: string;

  @IsOptional()
  @IsString({ message: 'code must be a string' })
  @Length(1, 5, { message: 'code must be between 1 and 5 characters long' })
  @Transform(({ value }) => {
    if (typeof value !== 'string') return value;
    return value.trim().toUpperCase();
  })
  code?: string;
}
