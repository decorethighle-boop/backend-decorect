import { ArgumentMetadata, Injectable, PipeTransform } from '@nestjs/common';
import { LoginDto } from '../../dto/login.dto';

@Injectable()
export class LoginPipe implements PipeTransform {
  transform(value: LoginDto, metadata: ArgumentMetadata) {
    const { clerkUserId } = value;

    if (!clerkUserId || typeof clerkUserId !== 'string') {
      throw new Error('Invalid clerkUserId');
    }

    return value;
  }
}
