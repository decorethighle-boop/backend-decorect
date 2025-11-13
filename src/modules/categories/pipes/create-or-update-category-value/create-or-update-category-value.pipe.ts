import { ArgumentMetadata, Injectable, PipeTransform } from '@nestjs/common';
import { CustomHttpException } from 'src/global/exceptions/custom-exception';
import { CreateOrUpdateCategoryValueDto } from '../../dto/create-or-update-category-value.dto';

@Injectable()
export class CreateOrUpdateCategoryValuePipe implements PipeTransform {
  transform(value: CreateOrUpdateCategoryValueDto, metadata: ArgumentMetadata) {
    if (metadata.type !== 'body') {
      return value;
    }

    const { id, parentCategoryId } = value;
    if (!id) {
      throw new CustomHttpException('id must be a valid UUID (v4)');
    }

    if (!parentCategoryId) {
      throw new CustomHttpException(
        'parentCategoryId must be a valid UUID (v4)',
      );
    }

    return value;
  }
}
