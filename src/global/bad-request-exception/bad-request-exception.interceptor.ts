import {
  CallHandler,
  ExecutionContext,
  HttpException,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Response } from 'express';
import { Observable, catchError, throwError } from 'rxjs';

@Injectable()
export class BadRequestInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const response = context.switchToHttp().getResponse<Response>();

    return next.handle().pipe(
      catchError(err => {
        if (err instanceof HttpException) {
          const errorResponse = err.getResponse();
          const message =
            typeof errorResponse === 'string'
              ? errorResponse
              : (errorResponse as any).message || 'Bad Request';

          response.status(400).json({
            data: null,
            message,
            success: false,
          });

          return new Observable();
        }

        return throwError(() => err);
      }),
    );
  }
}
