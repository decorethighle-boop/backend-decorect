import { IsString, IsUUID, Length } from 'class-validator';

export class CreateOrUpdatePermission {
  @IsUUID('4', { message: 'id must be a valid UUID (v4)' })
  id: string;

  @IsString({ message: 'name must be a string' })
  @Length(3, 50, { message: 'name must be between 3 and 50 characters long' })
  name: string;

  @IsString({ message: 'description must be a string' })
  @Length(0, 200, { message: 'description cannot exceed 200 characters' })
  description: string;
}
