import { ArgumentMetadata, Injectable, PipeTransform } from '@nestjs/common';
import { CustomHttpException } from 'src/global/exceptions/custom-exception';
import { FilterCategoryValues } from '../../types/filter-category-values.type';

@Injectable()
export class GetCategoryValuesPipe implements PipeTransform {
  transform(value: FilterCategoryValues, metadata: ArgumentMetadata) {
    const { productTypeId, all } = value;

    if (!productTypeId) {
      throw new CustomHttpException('productTypeId is required');
    }

    if (typeof all !== 'boolean') {
      if (all === 'true') {
        value.all = true;
      } else if (all === 'false') {
        value.all = false;
      } else {
        throw new CustomHttpException(
          'all must be a boolean or a string "true"/"false"',
        );
      }
    }

    return value;
  }
}
