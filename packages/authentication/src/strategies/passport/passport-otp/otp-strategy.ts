/* eslint-disable @typescript-eslint/no-explicit-any */
import {Request} from '@loopback/rest';
import passport from 'passport';

export namespace PassportOtp {
  export const CODE_FIELD = 'code';
  export const OWNER_FIELD = 'owner';
  export const TOKEN_FIELD = 'token';

  export interface StrategyOptionsWithRequest {
    passReqToCallback: boolean;
  }

  export type VerifyWithRequest = (
    req: Request,
    code: string,
    owner: string,
    token: string,
    done: (error?: string | Error | null, user?: any, info?: any) => void,
  ) => void;

  export type Verify = (
    code: string,
    owner: string,
    token: string,
    done: (error?: string | Error | null, user?: any, info?: any) => void,
  ) => void;

  export class Strategy extends passport.Strategy {
    name: string;
    private readonly verify: Verify | VerifyWithRequest;
    private readonly passReqToCallback: boolean;

    constructor(verify: Verify);

    constructor(options: StrategyOptionsWithRequest | Verify, verify?: VerifyWithRequest | Verify);

    constructor(options: StrategyOptionsWithRequest | Verify, verify?: VerifyWithRequest | Verify) {
      super();
      let opts: StrategyOptionsWithRequest = {passReqToCallback: false};
      if (verify) {
        opts = options as StrategyOptionsWithRequest;
      }
      this.verify = verify ? verify : (options as Verify);
      this.name = 'otp';
      this.passReqToCallback = opts.passReqToCallback;
    }

    authenticate(req: any, options?: {}): void {
      if (!req.body || !req.body[CODE_FIELD] || !req.body[OWNER_FIELD] || !req.body[TOKEN_FIELD]) {
        this.fail();
        return;
      }

      const code = req.body[CODE_FIELD];
      const owner = req.body[OWNER_FIELD];
      const token = req.body[TOKEN_FIELD];

      const verified = (err: any, user: any) => {
        if (err) {
          this.error(err);
          return;
        }
        if (!user) {
          this.fail();
          return;
        }
        this.success(user);
      };

      if (this.passReqToCallback) {
        (this.verify as VerifyWithRequest)(req, code, owner, token, verified);
      } else {
        (this.verify as Verify)(code, owner, token, verified);
      }
    }
  }
}
