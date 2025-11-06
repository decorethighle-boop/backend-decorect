import {
  ArrayNotEmpty,
  ArrayUnique,
  IsArray,
  IsString,
  IsUUID,
  IsUUID as IsUUIDArray,
  Length,
} from 'class-validator';

export class CreateOrUpdateRole {
  @IsUUID('4', { message: 'id must be a valid UUID (v4)' })
  id: string;

  @IsString({ message: 'name must be a string' })
  @Length(3, 50, { message: 'name must be between 3 and 50 characters long' })
  name: string;

  @IsArray({ message: 'permissions must be an array' })
  @ArrayNotEmpty({ message: 'permissions cannot be empty' })
  @ArrayUnique({ message: 'permissions must not contain duplicate values' })
  @IsUUIDArray('4', {
    each: true,
    message: 'each permission must be a valid UUID (v4)',
  })
  permissions: string[];
}
