import { HttpStatus, Injectable, NestMiddleware } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { NextFunction, Request, Response } from 'express';

import { match } from 'path-to-regexp';
import { CustomHttpException } from 'src/global/exceptions/custom-exception';
import { AuthService } from '../../services/auth.service';

@Injectable()
export class TokenMiddleware implements NestMiddleware {
  constructor(
    private readonly authService: AuthService,
    private readonly jwtService: JwtService,
  ) {}

  async use(req: Request, res: Response, next: NextFunction): Promise<void> {
    const optionalAuthRoutes = [
      { path: '/categories/values', method: 'GET' },
      { path: '/products', method: 'GET' },
      { path: '/products/:id', method: 'GET' },
      { path: '/ranges', method: 'GET' },
      { path: '/ranges/:id', method: 'GET' },
    ];

    const routeIsOptional = optionalAuthRoutes.some(route => {
      const matcher = match(route.path, { decode: decodeURIComponent });
      return route.method === req.method && matcher(req.path);
    });
    const authHeader = req.headers['authorization'];

    if (!authHeader) {
      if (routeIsOptional) {
        return next();
      }

      throw new CustomHttpException(
        'Missing Authorization header',
        HttpStatus.UNAUTHORIZED,
      );
    }

    if (!authHeader.startsWith('Bearer ')) {
      throw new CustomHttpException(
        'Invalid Authorization header',
        HttpStatus.UNAUTHORIZED,
      );
    }

    const token = authHeader.split(' ')[1];

    try {
      const decoded = this.jwtService.verify(token, {
        secret: process.env.JWT_SECRET,
      });

      const userId = decoded.sub;
      const useData = await this.authService.getRoleByUserId(userId);

      if (!useData) {
        throw new CustomHttpException(
          'User not found',
          HttpStatus.UNAUTHORIZED,
        );
      }

      if (
        decoded.parentRole.id !== useData.parentRole.id ||
        decoded.role?.id !== useData.role?.id
      ) {
        throw new CustomHttpException(
          'User role has changed. Please re-authenticate.',
          HttpStatus.UNAUTHORIZED,
        );
      }

      req['user'] = {
        ...decoded,
        role: useData.role,
        parentRole: decoded.parentRole,
      };

      next();
    } catch (error) {
      if (routeIsOptional) {
        return next();
      }
      throw new CustomHttpException(
        error.message || 'Invalid or expired token',
        HttpStatus.UNAUTHORIZED,
      );
    }
  }
}
