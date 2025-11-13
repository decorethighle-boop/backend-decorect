import { ArgumentMetadata, Injectable, PipeTransform } from '@nestjs/common';
import { CustomHttpException } from 'src/global/exceptions/custom-exception';
import { CreateOrUpdateCategoryDto } from '../../dto/create-or-update-category.dto';

@Injectable()
export class CreateOrUpdateParentPipe implements PipeTransform {
  transform(value: CreateOrUpdateCategoryDto, metadata: ArgumentMetadata) {
    if (metadata.type !== 'body') {
      return value;
    }

    const { id, name, productTypeId, grouper } = value;

    if (id && typeof id !== 'string') {
      throw new CustomHttpException('Parent category must have a valid ID');
    }

    if (!name) {
      throw new CustomHttpException('Parent category must have a name');
    }

    if (!productTypeId) {
      throw new CustomHttpException('productTypeId must be a valid UUID (v4)');
    }

    if (grouper !== undefined && typeof grouper !== 'boolean') {
      throw new CustomHttpException('grouper must be a boolean');
    }

    return value;
  }
}
