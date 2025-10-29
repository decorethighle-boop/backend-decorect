import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';
import { RefreshToken } from 'src/auth/types/refresh-token.type';

@Injectable()
export class RefreshTokenPipe implements PipeTransform {
  transform(value: RefreshToken) {
    const { refreshToken } = value;

    if (!refreshToken || typeof refreshToken !== 'string') {
      throw new BadRequestException('Invalid or missing refresh token');
    }
    return value;
  }
}
