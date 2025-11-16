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
    // Rutas que permiten no tener token
    const optionalAuthRoutes = [
      { path: '/categories/values', method: 'GET' },
      // Puedes agregar más rutas opcionales aquí
    ];

    const routeIsOptional = optionalAuthRoutes.some(
      r => r.path === req.path && r.method === req.method,
    );

    const authHeader = req.headers['authorization'];

    if (!authHeader) {
      if (routeIsOptional) {
        // No hay token, pero la ruta lo permite
        return next();
      }
      // No hay token y no está permitido
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
        // Si es ruta opcional y el token es inválido, seguimos sin user
        return next();
      }
      throw new CustomHttpException(
        error.message || 'Invalid or expired token',
        HttpStatus.UNAUTHORIZED,
      );
    }
  }
}
