import {InvocationContext, Provider, injectable} from '@loopback/context';
import {BindingScope} from '@loopback/core';
import {repository} from '@loopback/repository';
import {SecurityBindings, UserProfile, securityId} from '@loopback/security';

import {PrincipalResolver} from '../../../../../types';
import {User} from '../models';
import {UserRepository} from '../repositories';

@injectable({scope: BindingScope.SINGLETON})
export class PrincipalResolverProvider implements Provider<PrincipalResolver<User>> {
  constructor(
    @repository(UserRepository)
    private userRepository: UserRepository,
  ) {}

  value(): PrincipalResolver<User> {
    return invocationCtx => this.resolve(invocationCtx);
  }

  async resolve(invocationCtx: InvocationContext): Promise<User | undefined> {
    const profile = await invocationCtx.get<UserProfile>(SecurityBindings.USER);
    return new User({[User.getIdProperties()[0]]: profile[securityId], ...profile});
  }
}
