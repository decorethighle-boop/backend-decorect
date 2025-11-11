import {
  ArgumentMetadata,
  BadRequestException,
  Injectable,
  PipeTransform,
} from '@nestjs/common';
import { FilterProducts } from '../../types/filter-products.type';

@Injectable()
export class GetProductsPipe implements PipeTransform {
  transform(value: FilterProducts, metadata: ArgumentMetadata) {
    const { page, search, productTypeId, subCategoryId } = value;

    if (!productTypeId) {
      throw new BadRequestException('productTypeId is required');
    }

    return {
      page,
      search: search?.trim() || undefined,
      productTypeId,
      subCategoryId,
    };
  }
}
