import {Policy} from '@bleco/acl';
import {User} from '../models/user.model';

export const UserPolicy: Policy = {
  type: 'principal',
  model: User,
};
