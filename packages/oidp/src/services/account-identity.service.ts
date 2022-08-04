/**
 * The Account Identity service links a account to profiles from an external source (eg: ldap, oauth2 provider, saml)
 * which can identify the account. The profile typically has the following information:
 *   name, email-id, uuid, roles, authorizations, scope of accessible resources, expiration time for given access
 *
 * @example
 *  export class LDAPAccountIdentityService implements AccountIdentityService<LDAPAccountIdentity, AccountProfile> {
 *    constructor(
 *      @repository(AccountRepository)
 *      public accountRepository: AccountRepository,
 *      @repository(AccountIdentityRepository)
 *      public accountIdentityRepository: AccountIdentityRepository,
 *    ) {}
 *  }
 */
export interface AccountIdentityService<I, U> {
  /**
   * find or create a local account using a profile from an external source
   * @param accountIdentity
   *
   * @example
   *    async findOrCreateAccount(
   *      ldapAccount: LDAPAccountIdentity,
   *    ): Promise<AccountProfile> {
   *      let account: AccountProfile = await this.accountRepository.findOrCreate({
   *        name: ldapAccount.cn,
   *        accountname: ldapAccount.mail,
   *        roles: _.map(ldapAccount.memberof['ou=roles,dc=mydomain,o=myOrg'], 'cn')
   *      });
   *      await this.linkExternalProfile(account.id, ldapAccount);
   *      return account;
   *    }
   */
  findOrCreateAccount(accountIdentity: I): Promise<U>;

  /**
   * link an external profile with an existing local account id.
   * @param accountId
   * @param accountIdentity
   *
   * @example
   *    async linkExternalProfile(accountId: string, ldapAccount: LDAPAccountIdentity) {
   *      return await this.accountIdentityRepository.findOrCreate({
   *        provider: 'ldap',
   *        externalId: ldapAccount.id,
   *        authScheme: 'active-directory',
   *        accountId: accountId,
   *        credentials: {
   *          distinguishedName: ldapAccount.dn,
   *          roles: ldapAccount.memberof,
   *          expirationTime: ldapAccount.maxAge}
   *      });
   *    }
   *  }
   */
  linkExternalProfile(accountId: string, accountIdentity: I): Promise<U>;
}
