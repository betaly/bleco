import {BindingKey} from '@loopback/core';
import {PassportOtp} from './otp-strategy';

export namespace OtpAuthBindings {
  export const Config = BindingKey.create<PassportOtp.StrategyOptionsWithRequest>('eco.authentication.config.otp');
}
