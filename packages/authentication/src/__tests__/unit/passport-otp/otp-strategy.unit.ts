import {expect} from '@loopback/testlab';
import {Request} from '@loopback/rest';
import {IAuthUser} from '../../../types';
import {OtpStrategyFactory, OtpStrategyFactoryProvider, PassportOtp} from '../../../strategies';

describe('getting otp strategy with options', () => {
  it('should return strategy by passing options and passReqToCallback as true', async () => {
    const strategyVerifier: OtpStrategyFactory = await getStrategy();

    const options: PassportOtp.StrategyOptionsWithRequest = {
      passReqToCallback: true,
    };

    const localStrategyVerifier = strategyVerifier(options);

    expect(localStrategyVerifier).to.have.property('name');
    expect(localStrategyVerifier).to.have.property('authenticate').which.is.a.Function();
  });

  it('should return strategy by passing options and passReqToCallback as false', async () => {
    const strategyVerifier: OtpStrategyFactory = await getStrategy();

    const options: PassportOtp.StrategyOptionsWithRequest = {
      passReqToCallback: false,
    };

    const localStrategyVerifier = strategyVerifier(options);

    expect(localStrategyVerifier).to.have.property('name');
    expect(localStrategyVerifier).to.have.property('authenticate').which.is.a.Function();
  });

  it('should return strategy by not passing any options', async () => {
    const strategyVerifier: OtpStrategyFactory = await getStrategy();

    const localStrategyVerifier = strategyVerifier();

    expect(localStrategyVerifier).to.have.property('name');
    expect(localStrategyVerifier).to.have.property('authenticate').which.is.a.Function();
  });
});

async function getStrategy() {
  const provider = new OtpStrategyFactoryProvider(verifierOtp);

  //this fuction will return a function which will then accept options.
  return provider.value();
}

//returning a user
function verifierOtp(code: string, contact: string, token: string, req?: Request): Promise<IAuthUser | null> {
  const userToPass: IAuthUser = {
    id: 1,
    email: 'sample@microloop.com',
  };

  return new Promise(function (resolve, reject) {
    if (userToPass) {
      resolve(userToPass);
    }
  });
}
