import { ArgumentMetadata, Injectable, PipeTransform } from '@nestjs/common';
import { CustomHttpException } from 'src/global/exceptions/custom-exception';
import { FilterCategoryValues } from '../../types/filter-category-values.type';

@Injectable()
export class GetCategoryValuesPipe implements PipeTransform {
  transform(value: FilterCategoryValues, metadata: ArgumentMetadata) {
    const { productTypeId } = value;

    if (!productTypeId) {
      throw new CustomHttpException('productTypeId is required');
    }

    return value;
  }
}
