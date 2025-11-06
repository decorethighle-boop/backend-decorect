import { IsString } from 'class-validator';

export class LoginDto {
  @IsString({ message: 'name must be a string' })
  clerkUserId: string;
}
