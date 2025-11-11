import { IsBoolean, IsString, IsUUID } from 'class-validator';

export class CreateOrUpdateColorProductImageDto {
  @IsUUID()
  id: string;

  @IsUUID()
  categoryValueId: string;

  @IsString()
  image: string;

  @IsBoolean()
  default: boolean;
}
