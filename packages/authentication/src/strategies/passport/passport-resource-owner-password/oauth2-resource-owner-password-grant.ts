/* eslint-disable @typescript-eslint/no-explicit-any */
import * as passport from 'passport';

export const CLIENT_ID = 'client_id';
export const CLIENT_SECRET = 'client_secret';

export namespace Oauth2ResourceOwnerPassword {
  export interface CredentialsFields {
    usernameField?: string | undefined;
    passwordField?: string | undefined;
  }

  export interface StrategyOptionsWithRequestInterface extends CredentialsFields {
    passReqToCallback: boolean;
  }

  export type VerifyFunctionWithRequest = (
    req: any,
    clientId: string,
    clientSecret: string,
    username: string,
    password: string,
    done: (error: any, client?: any, info?: any) => void,
  ) => void;

  export type VerifyFunction = (
    clientId: string,
    clientSecret: string,
    username: string,
    password: string,
    done: (error: any, client?: any, info?: any) => void,
  ) => void;

  export class Strategy extends passport.Strategy {
    name: string;
    credentialsFields: Required<CredentialsFields>;
    private readonly verify: VerifyFunction | VerifyFunctionWithRequest;
    private readonly passReqToCallback: boolean;

    constructor(verify: VerifyFunction);

    constructor(
      options: StrategyOptionsWithRequestInterface | VerifyFunction,
      verify?: VerifyFunctionWithRequest | VerifyFunction,
    );

    constructor(
      options: StrategyOptionsWithRequestInterface | VerifyFunction,
      verify?: VerifyFunctionWithRequest | VerifyFunction,
    ) {
      super();
      let opts: StrategyOptionsWithRequestInterface = {passReqToCallback: false};
      if (verify) {
        opts = options as StrategyOptionsWithRequestInterface;
      }
      this.verify = verify ? verify : (options as VerifyFunction);
      this.name = 'oauth2-resource-owner-password';
      this.passReqToCallback = opts.passReqToCallback;
      this.credentialsFields = {
        usernameField: opts.usernameField ?? 'username',
        passwordField: opts.passwordField ?? 'password',
      };
    }

    authenticate(req: any, options?: {}): void {
      const {usernameField, passwordField} = this.credentialsFields;
      if (!req.body || !req.body[CLIENT_ID] || !req.body[usernameField] || !req.body[passwordField]) {
        this.fail();
        return;
      }

      const clientId = req.body[CLIENT_ID];
      const clientSecret = req.body[CLIENT_SECRET];
      const username = req.body[usernameField];
      const password = req.body[passwordField];

      const verified = (err: any, client: any, user: any) => {
        if (err) {
          this.error(err);
          return;
        }
        if (!client) {
          this.fail();
          return;
        }
        if (!user) {
          this.fail();
          return;
        }
        this.success(user);
      };

      if (this.passReqToCallback) {
        (this.verify as VerifyFunctionWithRequest)(req, clientId, clientSecret, username, password, verified);
      } else {
        (this.verify as VerifyFunction)(clientId, clientSecret, username, password, verified);
      }
    }
  }
}
