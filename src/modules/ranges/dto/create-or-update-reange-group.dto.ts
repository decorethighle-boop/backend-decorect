import { IsString, IsUUID, Length } from 'class-validator';

export class CreateOrUpdateRangeGroupDto {
  @IsUUID()
  id: string;

  @IsString()
  @Length(1, 150)
  name: string;
}
