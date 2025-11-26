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
import { AuthModule } from './modules/auth/auth.module';
import { AuthController } from './modules/auth/controllers/auth.controller';
import { ParentRole, Permission, Role, User } from './modules/auth/entities';
import { TokenMiddleware } from './modules/auth/middlewares/token/token.middleware';
import { CategoriesModule } from './modules/categories/categories.module';
import { CategoriesController } from './modules/categories/controllers/categories.controller';
import { CategoryValue } from './modules/categories/entities/category-value.entity';
import { Category } from './modules/categories/entities/category.entity';
import { ProductsController } from './modules/products/controllers/products.controller';
import { ProductType } from './modules/products/entities/product-type.entity';
import { Product } from './modules/products/entities/product.entity';
import { ProductsModule } from './modules/products/products.module';
import { RangesModule } from './modules/ranges/ranges.module';

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
      entities: [
        User,
        Role,
        ParentRole,
        Permission,
        Category,
        CategoryValue,
        ProductType,
        Product,
      ],
      synchronize: true,
      autoLoadEntities: true,
    }),
    AuthModule,
    ProductsModule,
    CategoriesModule,
    RangesModule,
  ],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(TokenMiddleware)
      .exclude({ path: '/auth/login', method: RequestMethod.POST })
      .forRoutes(AuthController, CategoriesController, ProductsController);
  }
}
