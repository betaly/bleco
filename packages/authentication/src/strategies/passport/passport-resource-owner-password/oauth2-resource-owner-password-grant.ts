/* eslint-disable @typescript-eslint/no-explicit-any */
import * as passport from 'passport';

export namespace Oauth2ResourceOwnerPassword {
  export interface StrategyFields {
    usernameField?: string | undefined;
    passwordField?: string | undefined;
    clientIdField?: string | undefined;
    clientSecretField?: string | undefined;
  }

  export interface StrategyOptionsWithRequestInterface extends StrategyFields {
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
    fields: Required<StrategyFields>;
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
      this.fields = {
        usernameField: opts.usernameField ?? 'username',
        passwordField: opts.passwordField ?? 'password',
        clientIdField: opts.clientIdField ?? 'client_id',
        clientSecretField: opts.clientSecretField ?? 'client_secret',
      };
    }

    authenticate(req: any, options?: {}): void {
      const {usernameField, passwordField, clientIdField, clientSecretField} = this.fields;
      if (!req.body || !req.body[clientIdField] || !req.body[usernameField] || !req.body[passwordField]) {
        this.fail();
        return;
      }

      const clientId = req.body[clientIdField];
      const clientSecret = req.body[clientSecretField];
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
