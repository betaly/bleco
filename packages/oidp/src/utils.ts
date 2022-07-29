import {OidcFindAccount} from './types';
import {AccountClaims} from 'oidc-provider';

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
