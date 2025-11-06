import { ArgumentMetadata, Injectable, PipeTransform } from '@nestjs/common';
import { CreateOrUpdateProductTypeDto } from '../../dto/create-or-update-product-type.dto';

@Injectable()
export class CreateOrUpdateProductTypesPipe implements PipeTransform {
  transform(value: CreateOrUpdateProductTypeDto, metadata: ArgumentMetadata) {
    const { id, name } = value;

    if (id && typeof id !== 'string') {
      throw new Error('Product type must have a valid ID');
    }

    if (!name) {
      throw new Error('Product type must have a name');
    }

    return value;
  }
}
