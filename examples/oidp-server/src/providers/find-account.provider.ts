import {OidcFindAccount} from '@bleco/oidp';
import {Provider, service} from '@loopback/core';
import {repository} from '@loopback/repository';
import {UserRepository} from '../repositories';
import {UserService} from '../services/user.service';

const debug = require('debug')('bleco:oidp-server:find-account');

export class FindAccountProvider implements Provider<OidcFindAccount> {
  constructor(
    @repository(UserRepository)
    private readonly userRepository: UserRepository,
    @service(UserService)
    private readonly userService: UserService,
  ) {}

  value(): OidcFindAccount {
    return (ctx, id, token) => this.findAccount(ctx, id, token);
  }

  findAccount: OidcFindAccount = async (ctx, id, token) => {
    debug('findAccount with {id=%s, token=%s}', id, token);
    const user = await this.userRepository.findById(parseInt(id));
    if (!user) {
      throw new Error('User not found');
    }
    debug('findAccount found user %o', user);
    return {
      accountId: id,
      claims: async (use, scope, claims, rejected) => {
        debug('claims for %O', {use, scope, claims, rejected});
        const profile = this.userService.convertToUserProfile(user);
        return {
          sub: id,
          ...profile,
        };
      },
    };
  };
}
