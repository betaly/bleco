import {expect} from '@loopback/testlab';
import * as AuthaStrategy from '@authajs/passport-autha';

import {AuthaStrategyFactory, AuthaStrategyFactoryProvider} from '../../../strategies/passport/passport-autha';
import {IAuthUser} from '../../../types';

describe('getting autha strategy with options', () => {
  it('should return strategy by passing options and passReqToCallback as true', async () => {
    const strategyVerifier: AuthaStrategyFactory = await getStrategy();

    const options: AuthaStrategy.StrategyOptions | AuthaStrategy.StrategyOptionsWithRequest = {
      endpoint: 'string',
      redirectUri: 'string',
      scope: '',
      clientID: 'string',
      clientSecret: 'string',
      passReqToCallback: true,
    };

    const authaAuthStrategyVerifier = strategyVerifier(options);

    expect(authaAuthStrategyVerifier).to.have.property('name');
    expect(authaAuthStrategyVerifier).to.have.property('authenticate').which.is.a.Function();
  });

  it('should return strategy by passing options and passReqToCallback as false', async () => {
    const strategyVerifier: AuthaStrategyFactory = await getStrategy();

    const options: AuthaStrategy.StrategyOptions | AuthaStrategy.StrategyOptionsWithRequest = {
      endpoint: 'string',
      redirectUri: 'string',
      scope: '',
      clientID: 'string',
      clientSecret: 'string',
      passReqToCallback: false,
    };

    const authaAuthStrategyVerifier = strategyVerifier(options);

    expect(authaAuthStrategyVerifier).to.have.property('name');
    expect(authaAuthStrategyVerifier).to.have.property('authenticate').which.is.a.Function();
  });
});

async function getStrategy() {
  const provider = new AuthaStrategyFactoryProvider(verifier);

  //this function will return a function which will then accept options.
  return provider.value();
}

//returning a user
function verifier(
  accessToken: string,
  refreshToken: string,
  profile: AuthaStrategy.Profile,
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
