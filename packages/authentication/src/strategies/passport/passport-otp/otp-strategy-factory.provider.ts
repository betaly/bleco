import isEmpty from 'tily/is/empty';
import merge from 'tily/object/merge';
import {Provider} from '@loopback/context';
import {inject} from '@loopback/core';
import {HttpErrors, Request} from '@loopback/rest';
import {PassportOtp} from './otp-strategy';
import {VerifyFunction} from '../../types';
import {Strategies} from '../../keys';
import {IAuthUser} from '../../../types';
import {AuthErrorKeys} from '../../../error-keys';
import {OtpAuthBindings} from './keys';

export type OtpStrategyFactory = (
  options?: PassportOtp.StrategyOptionsWithRequest,
  verifierPassed?: VerifyFunction.OtpAuthFn,
) => PassportOtp.Strategy;

export class OtpStrategyFactoryProvider implements Provider<OtpStrategyFactory> {
  constructor(
    @inject(Strategies.Passport.OTP_VERIFIER)
    private readonly verifierOtpAuth: VerifyFunction.OtpAuthFn,
    @inject(OtpAuthBindings.Config, {optional: true})
    private readonly config?: PassportOtp.StrategyOptionsWithRequest,
  ) {}

  value(): OtpStrategyFactory {
    return (options, verifier) => this.getOtpVerifier(options, verifier);
  }

  getOtpVerifier(
    options?: PassportOtp.StrategyOptionsWithRequest,
    verifierPassed?: VerifyFunction.OtpAuthFn,
  ): PassportOtp.Strategy {
    options = merge({}, this.config, options);
    const verifyFn = verifierPassed ?? this.verifierOtpAuth;
    if (options?.passReqToCallback) {
      return new PassportOtp.Strategy(
        options,
        // eslint-disable-next-line @typescript-eslint/no-misused-promises
        async (
          req: Request,
          code: string,
          contact: string,
          token: string,
          cb: (err?: Error | null, user?: IAuthUser | false) => void,
        ) => {
          try {
            const userInfo = await verifyFn(code, contact, token, req);
            if (!userInfo || isEmpty(userInfo)) {
              throw new HttpErrors.Unauthorized(AuthErrorKeys.InvalidCredentials);
            }
            cb(undefined, userInfo);
          } catch (err) {
            cb(err);
          }
        },
      );
    } else {
      return new PassportOtp.Strategy(
        // eslint-disable-next-line @typescript-eslint/no-misused-promises
        async (
          code: string,
          contact: string,
          token: string,
          cb: (err?: Error | null, user?: IAuthUser | false) => void,
        ) => {
          try {
            const userInfo = await verifyFn(code, contact, token);
            if (!userInfo || isEmpty(userInfo)) {
              throw new HttpErrors.Unauthorized(AuthErrorKeys.InvalidCredentials);
            }
            cb(undefined, userInfo);
          } catch (err) {
            cb(err);
          }
        },
      );
    }
  }
}
