import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../auth/entities';
import { EmailService } from '../email/services/email.service';
import { Product } from '../products/entities/product.entity';
import { ProductsModule } from '../products/products.module';
import { WishlistsController } from './controllers/wishlists.controller';
import { Wishlist } from './entities/wishlist.entity';
import { WishlistDbService } from './services/wishlists-db.service';
import { WishlistService } from './services/wishlists.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Wishlist, User, Product]),
    ProductsModule,
  ],
  controllers: [WishlistsController],
  providers: [WishlistDbService, WishlistService, EmailService],
})
export class WishlistModule {}
