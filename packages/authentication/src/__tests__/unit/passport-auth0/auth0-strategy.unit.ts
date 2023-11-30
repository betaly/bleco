import {expect} from '@loopback/testlab';
import * as Auth0Strategy from 'passport-auth0';

import {Auth0StrategyFactory, Auth0StrategyFactoryProvider} from '../../../strategies/passport/passport-auth0';
import {Auth0StrategyOptions} from '../../../strategies';
import {IAuthUser} from '../../../types';

describe('getting auth0 strategy with options', () => {
  it('should return strategy by passing options and passReqToCallback as true', async () => {
    const options: Auth0Strategy.StrategyOption | Auth0Strategy.StrategyOptionWithRequest = {
      clientID: 'string',
      clientSecret: 'string',
      callbackURL: 'string',
      domain: 'string',
    };

    const strategyVerifier: Auth0StrategyFactory = await getStrategy(options);

    const auth0AuthStrategyVerifier = strategyVerifier({
      passReqToCallback: true,
    });

    expect(auth0AuthStrategyVerifier).to.have.property('name');
    expect(auth0AuthStrategyVerifier).to.have.property('authenticate').which.is.a.Function();
    expect(auth0AuthStrategyVerifier.options).to.match({
      ...options,
      passReqToCallback: true,
    });
  });

  it('should return strategy by passing options and passReqToCallback as undefined', async () => {
    const options: Auth0Strategy.StrategyOption | Auth0Strategy.StrategyOptionWithRequest = {
      clientID: 'string',
      clientSecret: 'string',
      callbackURL: 'string',
      domain: 'string',
    };

    const strategyVerifier: Auth0StrategyFactory = await getStrategy(options);

    const auth0AuthStrategyVerifier = strategyVerifier({});

    expect(auth0AuthStrategyVerifier).to.have.property('name');
    expect(auth0AuthStrategyVerifier).to.have.property('authenticate').which.is.a.Function();
    expect(auth0AuthStrategyVerifier.options).to.match(options);
  });
});

async function getStrategy(options?: Auth0StrategyOptions) {
  const provider = new Auth0StrategyFactoryProvider(verifier, options);

  //this function will return a function which will then accept options.
  return provider.value();
}

//returning a user
function verifier(
  accessToken: string,
  refreshToken: string,
  profile: Auth0Strategy.Profile,
): Promise<IAuthUser | null> {
  const userToPass: IAuthUser = {
    id: 1,
    username: 'xyz',
    password: 'pass',
  };

  return new Promise(function (resolve, reject) {
    if (userToPass) {
      resolve(userToPass);
    }
  });
}
