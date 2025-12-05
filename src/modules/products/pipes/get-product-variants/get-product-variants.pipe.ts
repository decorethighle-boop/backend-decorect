import { ArgumentMetadata, Injectable, PipeTransform } from '@nestjs/common';
import { CustomHttpException } from 'src/global/exceptions/custom-exception';
import { FilterVariants } from '../../types/filter-variant.type';

@Injectable()
export class GetProductVariantsPipe implements PipeTransform {
  transform(value: FilterVariants, metadata: ArgumentMetadata) {
    if (metadata.type !== 'query') {
      return value;
    }

    const { page, productTypeId, categoryValueIds } = value;

    if (page) {
      value.page = Number(page);
    }

    if (!productTypeId) {
      throw new CustomHttpException('Product type ID is required');
    }

    if (categoryValueIds && typeof categoryValueIds === 'string') {
      value.categoryValueIds = categoryValueIds.split(',');
    }

    return value;
  }
}
