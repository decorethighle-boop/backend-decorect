import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
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
import { EmailModule } from './modules/email/email.module';
import { ProductionCountry } from './modules/production_countries/entities/production-country.entity';
import { ProductionCountriesModule } from './modules/production_countries/production_countries.module';
import { ProductsController } from './modules/products/controllers/products.controller';
import { ProductType } from './modules/products/entities/product-type.entity';
import { Product } from './modules/products/entities/product.entity';
import { ProductsModule } from './modules/products/products.module';
import { RangesController } from './modules/ranges/controllers/ranges.controller';
import { RangesModule } from './modules/ranges/ranges.module';
import { SettingsModule } from './modules/settings/settings.module';
import { Supplier } from './modules/suppliers/entity/supplier.entity';
import { SuppliersModule } from './modules/suppliers/suppliers.module';
import { WishlistsController } from './modules/wishlist/controllers/wishlists.controller';
import { Wishlist } from './modules/wishlist/entities/wishlist.entity';
import { WishlistModule } from './modules/wishlist/wishlist.module';

config({ path: ['.env'] });

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
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
        Wishlist,
        ProductionCountry,
        Supplier,
      ],
      synchronize: true,
      autoLoadEntities: true,
    }),
    AuthModule,
    ProductsModule,
    CategoriesModule,
    RangesModule,
    WishlistModule,
    ProductionCountriesModule,
    SuppliersModule,
    SettingsModule,
    EmailModule,
  ],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(TokenMiddleware)
      .exclude(
        { path: '/auth/login', method: RequestMethod.POST },
        { path: '/settings', method: RequestMethod.GET },
        { path: '/settings/*', method: RequestMethod.GET },
      )
      .forRoutes(
        AuthController,
        CategoriesController,
        ProductsController,
        WishlistsController,
        RangesController,
        ProductionCountriesModule,
        SuppliersModule,
        SettingsModule,
      );
  }
}
