import { ArgumentMetadata, Injectable, PipeTransform } from '@nestjs/common';
import { CustomHttpException } from 'src/global/exceptions/custom-exception';
import { CreateOrUpdateProductTypeDto } from '../../dto/create-or-update-product-type.dto';

@Injectable()
export class CreateOrUpdateProductTypesPipe implements PipeTransform {
  transform(value: CreateOrUpdateProductTypeDto, metadata: ArgumentMetadata) {
    if (metadata.type !== 'body') {
      return value;
    }

    const { id, name } = value;

    if (id && typeof id !== 'string') {
      throw new CustomHttpException('Product type must have a valid ID');
    }

    if (!name) {
      throw new CustomHttpException('Product type must have a name');
    }

    return value;
  }
}
