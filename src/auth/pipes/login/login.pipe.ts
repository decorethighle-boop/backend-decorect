import { ArgumentMetadata, Injectable, PipeTransform } from '@nestjs/common';
import { LoginType } from 'src/auth/types/login.type';

@Injectable()
export class LoginPipe implements PipeTransform {
  transform(value: LoginType, metadata: ArgumentMetadata) {
    const { clerkUserId } = value;

    if (!clerkUserId || typeof clerkUserId !== 'string') {
      throw new Error('Invalid clerkUserId');
    }

    return value;
  }
}
