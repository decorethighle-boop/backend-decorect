import { ArgumentMetadata, Injectable, PipeTransform } from '@nestjs/common';
import { CreateOrUpdateProductDto } from 'src/modules/products/dto/create-or-update-product.dto';

@Injectable()
export class CreateOrUpdateProductionCountryPipe implements PipeTransform {
  transform(value: CreateOrUpdateProductDto, metadata: ArgumentMetadata) {
    if (metadata.type !== 'body') {
      return value;
    }

    const { productionCountryId, name } = value;

    if (productionCountryId && typeof productionCountryId !== 'string') {
      throw new Error('Production country must have a valid ID');
    }

    if (!name) {
      throw new Error('Production country must have a name');
    }

    return value;
  }
}
