import {AccountProfile} from '../types';

/**
 * A service for performing the login action in an authentication strategy.
 *
 * Usually a client account uses basic credentials to login, or is redirected to a
 * third-party application that grants limited access.
 *
 *
 * Note: The creation of account is handled in the account controller by calling account repository APIs.
 * For Basic auth, the account has to register first using some endpoint like `/register`.
 * For 3rd-party auth, the account will be created if login is successful
 * and the account doesn't exist in database yet.
 *
 * Type `C` stands for the type of your credential object.
 *
 * - For local strategy:
 *
 * A typical credential would be:
 * {
 *   username: username,
 *   password: password
 * }
 *
 * - For oauth strategy:
 *
 * A typical credential would be:
 * {
 *   clientId: string;
 *   clientSecret: string;
 *   callbackURL: string;
 * }
 *
 * It could be read from a local configuration file in the app
 *
 * - For saml strategy:
 *
 * A typical credential would be:
 *
 * {
 *   path: string;
 *   issuer: string;
 *   entryPoint: string;
 * }
 *
 * It could be read from a local configuration file in the app.
 */
export interface AccountService<U, C> {
  /**
   * Verify the identity of a account, construct a corresponding account profile using
   * the account information and return the account profile.
   *
   * @example
   * A pseudocode for basic authentication:
   * ```ts
   * verifyCredentials(credentials: C): Promise<U> {
   *   // the id field shouldn't be hardcoded
   *   account = await AccountRepo.find(credentials.id);
   *   matched = await passwordService.compare(account.password, credentials.password);
   *   if (matched) return account;
   *   // throw a JS error, agnostic of the client type
   *   throw new Error('authentication failed');
   * };
   * ```
   *
   * A pseudo code for 3rd party authentication:
   * ```ts
   * type AccountInfo = {
   *   accessToken: string;
   *   refreshToken: string;
   *   accountProfile: string;
   * };
   * verifyCredentials(credentials: C): Promise<U> {
   *   try {
   *     accountInfo: AccountInfo = await getAccountInfoFromFB(credentials);
   *   } catch (e) {
   *     // throw a JS error, agnostic of the client type
   *     throw e;
   *   }
   * };
   * ```
   * @param credentials - Credentials for basic auth or configurations for 3rd party.
   *                    Example see the
   */
  verifyCredentials(credentials: C): Promise<U>;

  /**
   * Convert the account returned by `verifyCredentials()` to a common
   * account profile that describes a account in your application
   * @param account - The account returned from `verifyCredentials()`
   */
  convertToAccountProfile(account: U): AccountProfile;
}
