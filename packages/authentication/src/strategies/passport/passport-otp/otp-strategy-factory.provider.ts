import {inject, Provider} from '@loopback/core';

import {AuthenticationErrors} from '../../../errors';
import {Strategies} from '../../keys';
import {VerifyFunction} from '../../types';
import {Otp} from './otp-auth';

export interface PassportOtpStrategyFactory {
  (options: Otp.StrategyOptions, verifierPassed?: VerifyFunction.OtpAuthFn): Otp.Strategy;
}

export class PassportOtpStrategyFactoryProvider implements Provider<PassportOtpStrategyFactory> {
  constructor(
    @inject(Strategies.Passport.OTP_VERIFIER)
    private readonly verifierOtp: VerifyFunction.OtpAuthFn,
    @inject(Strategies.Passport.OTP_AUTH_STRATEGY_OPTIONS, {optional: true})
    private readonly options?: Otp.StrategyOptions,
  ) {}

  value(): PassportOtpStrategyFactory {
    return (options, verifier) => this.getPassportOtpStrategyVerifier(options, verifier);
  }

  getPassportOtpStrategyVerifier(
    options?: Otp.StrategyOptions,
    verifierPassed?: VerifyFunction.OtpAuthFn,
  ): Otp.Strategy {
    options = {...this.options, ...options};
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
