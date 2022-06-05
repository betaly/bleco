import {injectable, InvocationContext} from '@loopback/context';
import {BindingScope} from '@loopback/core';
import {repository} from '@loopback/repository';
import {SecurityBindings, securityId, UserProfile} from '@loopback/security';
import {PrincipalService} from '../../../../../services';
import {User} from '../models';
import {UserRepository} from '../repositories';

@injectable({scope: BindingScope.SINGLETON})
export class UserPrincipalService implements PrincipalService<User> {
  constructor(
    @repository(UserRepository)
    private userRepository: UserRepository,
  ) {}

  async getPrincipal(invocationCtx: InvocationContext): Promise<User | undefined> {
    const profile = await invocationCtx.get<UserProfile>(SecurityBindings.USER);
    return new User({[User.getIdProperties()[0]]: profile[securityId], ...profile});
  }
}
