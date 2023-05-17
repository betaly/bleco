import {BindingScope, injectable} from '@loopback/core';
import {repository} from '@loopback/repository';
import {UserProfile, securityId} from '@loopback/security';
import {compare} from 'bcryptjs';
import {BErrors} from 'berrors';

import {User} from '../models';
import {UserRepository} from '../repositories';

/**
 * A pre-defined type for user credentials. It assumes a user logs in
 * using the email and password. You can modify it if your app has different credential fields
 */
export type Credentials = {
  login: string;
  password: string;
};

@injectable({scope: BindingScope.SINGLETON})
export class UserService {
  constructor(@repository(UserRepository) public userRepository: UserRepository) {}

  async verifyCredentials(credentials: Credentials): Promise<User> {
    const invalidCredentialsError = 'Invalid email or password.';

    const foundUser = await this.userRepository.findOne({
      where: {or: [{email: credentials.login}, {username: credentials.login}]},
    });
    if (!foundUser) {
      throw new BErrors.Unauthorized(invalidCredentialsError);
    }

    const credentialsFound = await this.userRepository.findCredentials(foundUser.id);
    if (!credentialsFound) {
      throw new BErrors.Unauthorized(invalidCredentialsError);
    }

    const passwordMatched = await compare(credentials.password, credentialsFound.password);

    if (!passwordMatched) {
      throw new BErrors.Unauthorized(invalidCredentialsError);
    }

    return foundUser;
  }

  convertToUserProfile(user: User): UserProfile {
    return {
      [securityId]: user.id.toString(),
      name: user.username,
      id: user.id,
      email: user.email,
    };
  }
}
