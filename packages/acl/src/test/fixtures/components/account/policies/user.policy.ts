import {definePrincipalPolicy} from '../../../../../policies';
import {User} from '../models';

export const UserPolicy = definePrincipalPolicy({
  model: User,
});
