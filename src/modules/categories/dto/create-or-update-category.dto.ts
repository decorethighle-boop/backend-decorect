import { IsString, IsUUID, Length } from 'class-validator';

export class CreateOrUpdateCategoryDto {
  @IsUUID('4', { message: 'id must be a valid UUID (v4)' })
  id: string;

  @IsString({ message: 'name must be a string' })
  @Length(1, 120, { message: 'name must be between 1 and 120 characters long' })
  name: string;
}
