import {Entity} from '@loopback/repository';
import {UserLike} from './types';

export function getUserId(user: UserLike): string {
  if (user instanceof Entity) {
    return user.getId().toString();
  } else if ('id' in user) {
    return user.id?.toString() ?? '';
  }
  return '';
}
