import { ArgumentMetadata, Injectable, PipeTransform } from '@nestjs/common';
import { CreateOrUpdateSupplierDto } from '../../dto/creater-or-update-supplier.dto';

@Injectable()
export class CreateOrUpdateSupplierPipe implements PipeTransform {
  transform(value: CreateOrUpdateSupplierDto, metadata: ArgumentMetadata) {
    if (metadata.type !== 'body') {
      return value;
    }

    const { id, name } = value;

    if (id && typeof id !== 'string') {
      throw new Error('Production country must have a valid ID');
    }

    if (!name) {
      throw new Error('Production country must have a name');
    }

    return value;
  }
}
