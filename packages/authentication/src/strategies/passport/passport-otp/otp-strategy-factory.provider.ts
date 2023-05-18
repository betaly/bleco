import {inject, Provider} from '@loopback/core';
import {Strategies} from '../../keys';
import {VerifyFunction} from '../../types';
import {Otp} from './otp-auth';
import {AuthenticationErrors} from '../../../errors';

export interface PassportOtpStrategyFactory {
  (options: Otp.StrategyOptions, verifierPassed?: VerifyFunction.OtpAuthFn): Otp.Strategy;
}

export class PassportOtpStrategyFactoryProvider implements Provider<PassportOtpStrategyFactory> {
  constructor(
    @inject(Strategies.Passport.OTP_VERIFIER)
    private readonly verifierOtp: VerifyFunction.OtpAuthFn,
  ) {}

  value(): PassportOtpStrategyFactory {
    return (options, verifier) => this.getPassportOtpStrategyVerifier(options, verifier);
  }

  getPassportOtpStrategyVerifier(
    options?: Otp.StrategyOptions,
    verifierPassed?: VerifyFunction.OtpAuthFn,
  ): Otp.Strategy {
    const verifyFn = verifierPassed ?? this.verifierOtp;
    return new Otp.Strategy(
      options,
      // eslint-disable-next-line @typescript-eslint/no-misused-promises
      async (key: string, otp: string, cb: Otp.VerifyCallback) => {
        try {
          const user = await verifyFn(key, otp);
          if (!user) {
            throw new AuthenticationErrors.InvalidCredentials();
          }
          cb(null, user);
        } catch (err) {
          cb(err);
        }
      },
    );
  }
}
