import {User} from './models/user.model';

export const policy = {
  actors: {[User.name]: {}},
};
