import {ActorPolicy} from '../../../policy';
import {User} from '../models/user.model';

export const UserPolicy: ActorPolicy = {
  type: 'actor',
  model: User,
};
