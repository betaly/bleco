import * as AuthaStrategy from '@authajs/passport-autha';
import {expect} from '@loopback/testlab';

import {AuthaStrategyFactory, AuthaStrategyFactoryProvider} from '../../../strategies/passport/passport-autha';
import {AuthaStrategyOptions, IAuthUser} from '../../../types';

describe('getting autha strategy with options', () => {
  it('should return strategy by passing options and passReqToCallback as true', async () => {
    const options: AuthaStrategy.StrategyOptions | AuthaStrategy.StrategyOptionsWithRequest = {
      endpoint: 'string',
      redirectUri: 'string',
      scope: '',
      clientID: 'string',
      clientSecret: 'string',
    };

    const strategyVerifier: AuthaStrategyFactory = await getStrategy(options);

    const authaAuthStrategyVerifier = strategyVerifier({
      passReqToCallback: true,
    });

    expect(authaAuthStrategyVerifier).to.have.property('name');
    expect(authaAuthStrategyVerifier).to.have.property('authenticate').which.is.a.Function();
    expect(authaAuthStrategyVerifier.options).to.match({
      ...options,
      passReqToCallback: true,
    });
  });

  it('should return strategy by passing options and passReqToCallback as false', async () => {
    const options: AuthaStrategy.StrategyOptions | AuthaStrategy.StrategyOptionsWithRequest = {
      endpoint: 'string',
      redirectUri: 'string',
      scope: '',
      clientID: 'string',
      clientSecret: 'string',
    };

    const strategyVerifier: AuthaStrategyFactory = await getStrategy(options);

    const authaAuthStrategyVerifier = strategyVerifier({
      passReqToCallback: false,
    });

    expect(authaAuthStrategyVerifier).to.have.property('name');
    expect(authaAuthStrategyVerifier).to.have.property('authenticate').which.is.a.Function();
    expect(authaAuthStrategyVerifier.options).to.match({
      ...options,
      passReqToCallback: false,
    });
  });
});

async function getStrategy(options?: AuthaStrategyOptions) {
  const provider = new AuthaStrategyFactoryProvider(verifier, options);

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
