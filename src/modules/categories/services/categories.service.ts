// src/modules/categories/services/categories.service.tso '../global/slug.util' según tus paths
import { Injectable } from '@nestjs/common';
import { CategoriesDbService } from './categories-db.service';

@Injectable()
export class CategoriesService {
  constructor(private readonly db: CategoriesDbService) {}
}
