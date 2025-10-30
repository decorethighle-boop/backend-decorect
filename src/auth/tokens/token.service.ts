import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities';
import { createJwtPayload, JwtPayload } from '../types/jwt-payload.interface';
import { TokenResponse } from '../types/token-response';

@Injectable()
export class TokenService {
  constructor(
    private jwtService: JwtService,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  generateTokens(payload: JwtPayload): TokenResponse {
    const accessToken = this.jwtService.sign(payload, {
      secret: process.env.JWT_SECRET,
      expiresIn: '1d',
    });

    const refreshToken = this.jwtService.sign(payload, {
      secret: process.env.JWT_REFRESH_SECRET,
      expiresIn: '7d',
    });

    return {
      accessToken,
      refreshToken,
    };
  }

  async refreshTokens(refreshToken: string): Promise<TokenResponse> {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: process.env.JWT_REFRESH_SECRET,
      });

      const user = await this.userRepository.findOne({
        where: { id: payload.sub },
        relations: ['parentRole', 'role'],
      });

      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      const jwtPayload = createJwtPayload({
        sub: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        imageUrl: user.imageUrl,
        email: user.email,
        role: user.role ? user.role : undefined,
        parentRole: user.parentRole,
      });

      return this.generateTokens(jwtPayload);
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }
}
