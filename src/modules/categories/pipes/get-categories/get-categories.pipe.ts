import { ArgumentMetadata, Injectable, PipeTransform } from '@nestjs/common';
import { CustomHttpException } from 'src/global/exceptions/custom-exception';
import { FilterCategories } from '../../types/filter-categories.type';

@Injectable()
export class GetCategoriesPipe implements PipeTransform {
  transform(value: FilterCategories, metadata: ArgumentMetadata) {
    const { productTypeId } = value;

    if (!productTypeId) {
      throw new CustomHttpException('productTypeId is required');
    }
    return value;
  }
}
