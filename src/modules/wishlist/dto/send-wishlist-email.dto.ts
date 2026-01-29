import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class SendWishlistEmailDto {
  @IsEmail()
  @IsNotEmpty()
  emailTo: string;

  @IsString()
  @IsNotEmpty()
  name: string;
}
