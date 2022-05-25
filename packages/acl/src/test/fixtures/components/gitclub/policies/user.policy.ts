import {PrincipalPolicy} from '../../../../../policies';
import {User} from '../models';

export const UserPolicy: PrincipalPolicy = {
  type: 'principal',
  model: User,
};
