import {PrincipalPolicy} from '../../../../../policy';
import {User} from '../models';

export const UserPolicy: PrincipalPolicy = {
  type: 'principal',
  model: User,
};
