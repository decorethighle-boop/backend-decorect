import { ArgumentMetadata, Injectable, PipeTransform } from '@nestjs/common';
import { CreateOrUpdateCategoryValueDto } from '../../dto/create-or-update-category-value.dto';

@Injectable()
export class CreateOrUpdateCategoryValuePipe implements PipeTransform {
  transform(value: CreateOrUpdateCategoryValueDto, metadata: ArgumentMetadata) {
    const { id, parentCategoryId, productTypeId } = value;
    if (!id) {
      throw new Error('id must be a valid UUID (v4)');
    }

    if (!parentCategoryId) {
      throw new Error('parentCategoryId must be a valid UUID (v4)');
    }

    if (!productTypeId) {
      throw new Error('productTypeId must be a valid UUID (v4)');
    }

    return value;
  }
}
