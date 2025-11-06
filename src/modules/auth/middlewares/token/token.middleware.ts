import { HttpStatus, Injectable, NestMiddleware } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { NextFunction, Request, Response } from 'express';

import { CustomHttpException } from 'src/global/exceptions/custom-exception';
import { AuthService } from '../../services/auth.service';

@Injectable()
export class TokenMiddleware implements NestMiddleware {
  constructor(
    private readonly authService: AuthService,
    private readonly jwtService: JwtService,
  ) {}

  async use(req: Request, res: Response, next: NextFunction): Promise<void> {
    // const authHeader = req.headers['authorization'];

    // if (!authHeader || !authHeader.startsWith('Bearer ')) {
    //   throw new CustomHttpException(
    //     'Missing or invalid Authorization header',
    //     HttpStatus.UNAUTHORIZED,
    //   );
    // }

    // const token = authHeader.split(' ')[1];

    try {
      // const decoded = this.jwtService.verify(token, {
      //   secret: process.env.JWT_SECRET,
      // });

      // const userId = decoded.sub;
      // const useData = await this.authService.getRoleByUserId(userId);
      // if (!useData) {
      //   throw new CustomHttpException(
      //     'User not found',
      //     HttpStatus.UNAUTHORIZED,
      //   );
      // }

      // if (
      //   useData &&
      //   (decoded.parentRole.id !== useData.parentRole.id ||
      //     decoded.role?.id !== useData.role?.id)
      // ) {
      //   throw new CustomHttpException(
      //     'User role has changed. Please re-authenticate.',
      //     HttpStatus.UNAUTHORIZED,
      //   );
      // }

      // req['user'] = {
      //   ...decoded,
      //   role: useData.role,
      //   parentRole: decoded.parentRole,
      // };

      next();
    } catch (error) {
      throw new CustomHttpException(
        error.message || 'Invalid or expired token',
        HttpStatus.UNAUTHORIZED,
      );
    }
  }
}
