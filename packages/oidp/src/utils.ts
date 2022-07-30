import {AccountClaims} from 'oidc-provider';
import {OidcFindAccount} from './types';

export const BasicFindAccount: OidcFindAccount = (ctx, id) => {
  return {
    accountId: id,
    async claims(): Promise<AccountClaims> {
      return {
        sub: id,
      };
    },
  };
};
