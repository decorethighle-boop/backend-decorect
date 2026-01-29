import { ArgumentMetadata, Injectable, PipeTransform } from '@nestjs/common';
import { SendWishlistEmailDto } from '../../dto/send-wishlist-email.dto';

@Injectable()
export class SendWishlistEmailPipe implements PipeTransform {
  transform(value: SendWishlistEmailDto, metadata: ArgumentMetadata) {
    if (metadata.type !== 'body') {
      return value;
    }

    const { emailTo, name } = value;

    if (!emailTo) {
      throw new Error('EmailTo is required');
    }

    if (!name) {
      throw new Error('Name is required');
    }

    return value;
  }
}
