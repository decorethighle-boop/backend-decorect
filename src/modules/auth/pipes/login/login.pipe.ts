import { ArgumentMetadata, Injectable, PipeTransform } from '@nestjs/common';
import { CustomHttpException } from 'src/global/exceptions/custom-exception';
import { LoginDto } from '../../dto/login.dto';

@Injectable()
export class LoginPipe implements PipeTransform {
  transform(value: LoginDto, metadata: ArgumentMetadata) {
    const { clerkUserId } = value;

    if (!clerkUserId || typeof clerkUserId !== 'string') {
      throw new CustomHttpException('Invalid clerkUserId');
    }

    return value;
  }
}
