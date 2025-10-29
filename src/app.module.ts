import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { config } from 'dotenv';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { ParentRole, Permission, Role, User } from './auth/entities';

config({ path: ['.env'] });

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      url: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
      entities: [User, Role, ParentRole, Permission],
      synchronize: true,
    }),
    AuthModule,
  ],
  providers: [AppService],
})
export class AppModule {}
