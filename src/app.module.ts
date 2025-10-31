import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { config } from 'dotenv';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { ParentRole, Permission, Role, User } from './auth/entities';
import { TokenMiddleware } from './auth/middlewares/token/token.middleware';
import { AuthController } from './auth/services/auth.controller';
import { CategoriesModule } from './categories/categories.module';
import { ProductsModule } from './products/products.module';

config({ path: ['.env'] });

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '1d' },
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      url: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
      entities: [User, Role, ParentRole, Permission],
      synchronize: true,
    }),
    AuthModule,
    ProductsModule,
    CategoriesModule,
  ],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(TokenMiddleware)
      .exclude({ path: '/auth/login', method: RequestMethod.POST })
      .forRoutes(AuthController);
  }
}
