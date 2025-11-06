import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from '../entities/category.entity';

@Injectable()
export class CategoriesDbService {
  constructor(
    @InjectRepository(Category)
    private readonly repo: Repository<Category>,
  ) {}
}
