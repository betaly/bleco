import copy from '@stdlib/utils-copy';
import {randomBytes} from 'crypto';
import {exportJWK, generateKeyPair} from 'jose';
import {Bucket, Store} from 'kvs';
import {JWK} from 'oidc-provider';
import {OidcAdapterFactory, OidcConfiguration, OidcFindAccount, OidcProvider} from '../types';
import {BasicFindAccount} from '../utils';

export interface OidcProviderFactoryOptions {
  /**
   * Base URL of the server.
   */
  baseUrl: string;

  /**
   * Path for all requests targeting the OIDC library.
   */
  oidcPath: string;

  /**
   * Storage used to store cookie and JWT keys so they can be re-used in case of multithreading.
   */
  store: Store;

  findAccount?: OidcFindAccount;

  adapterFactory?: OidcAdapterFactory;
}

interface OidcSecrets {
  jwks: {keys: JWK[]};
  cookieSecret: string[];
}

/**
 * Creates an OIDC Provider based on the provided configuration and parameters.
 * The provider will be cached and returned on subsequent calls.
 * Cookie and JWT keys will be stored in an internal storage so they can be re-used over multiple threads.
 * Necessary claims for Solid OIDC interactions will be added.
 * Routes will be updated based on the `baseUrl` and `oidcPath`.
 */
export class OidcProviderFactory {
  private readonly baseUrl!: string;
  private readonly oidcPath!: string;
  private readonly adapterFactory?: OidcAdapterFactory;
  private readonly secretsBucket: Bucket<OidcSecrets>;

  private readonly jwtAlg = 'ES256';

  constructor(private readonly config: OidcConfiguration, private readonly options: OidcProviderFactoryOptions) {
    this.baseUrl = options.baseUrl;
    this.oidcPath = options.oidcPath;
    this.adapterFactory = options.adapterFactory;

    const store = options.store;

    this.secretsBucket = store.bucket('oidc-secrets');
  }

  async createProvider(): Promise<OidcProvider> {
    const config = await this.initConfig();

    // Add correct claims to IdToken/AccessToken responses
    this.configureClaims(config);

    // Make sure routes are contained in the IDP space
    this.configureRoutes(config);

    // Render errors with our own error handler
    this.configureErrors(config);

    const provider = new OidcProvider(this.baseUrl, config);
    provider.proxy = true;
    return provider;
  }

  private async initConfig(): Promise<OidcConfiguration> {
    // Create a deep copy
    const config: OidcConfiguration = copy(this.config);

    config.adapter = config.adapter ?? this.adapterFactory;

    config.jwks = config.jwks ?? (await this.getOrGenerateJwks());
    config.cookies = {
      ...config.cookies,
      keys: await this.getOrGenerateCookieKeys(),
    };

    config.pkce = config.pkce ?? {
      methods: ['S256'],
      required: (): true => true,
    };

    // Default client settings that might not be defined.
    // Mostly relevant for WebID clients.
    config.clientDefaults = config.clientDefaults ?? {
      id_token_signed_response_alg: this.jwtAlg,
    };

    return config;
  }

  /**
   * Generates a JWKS using a single JWK.
   * The JWKS will be cached so subsequent calls return the same key.
   */
  private async getOrGenerateJwks(): Promise<{keys: JWK[]}> {
    // Check to see if the keys are already saved
    const jwks = (await this.secretsBucket.get('jwks')) as {keys: JWK[]} | undefined;
    if (jwks) {
      return jwks;
    }
    // If they are not, generate and save them
    const {privateKey} = await generateKeyPair(this.jwtAlg);
    const jwk = await exportJWK(privateKey);
    // Required for Solid authn client
    jwk.alg = this.jwtAlg;
    // In node v15.12.0 the JWKS does not get accepted because the JWK is not a plain object,
    // which is why we convert it into a plain object here.
    // Potentially this can be changed at a later point in time to `{ keys: [ jwk ]}`.
    const newJwks = {keys: [{...jwk}]};
    await this.secretsBucket.set('jwks', newJwks);
    return newJwks;
  }

  /**
   * Generates a cookie secret to be used for cookie signing.
   * The key will be cached so subsequent calls return the same key.
   */
  private async getOrGenerateCookieKeys(): Promise<string[]> {
    // Check to see if the keys are already saved
    const cookieSecret = await this.secretsBucket.get('cookieSecret');
    if (Array.isArray(cookieSecret)) {
      return cookieSecret;
    }
    // If they are not, generate and save them
    const newCookieSecret = [randomBytes(64).toString('hex')];
    await this.secretsBucket.set('cookieSecret', newCookieSecret);
    return newCookieSecret;
  }

  /**
   * Adds the necessary claims the to id and access tokens based on the Solid OIDC spec.
   */
  private configureClaims(config: OidcConfiguration): void {
    if (!config.findAccount) {
      config.findAccount = this.options.findAccount ?? BasicFindAccount;
    }

    config.features = {
      ...config.features,
      //
    };
  }

  // /**
  //  * Creates the route string as required by the `oidc-provider` library.
  //  * In case base URL is `http://test.com/foo/`, `oidcPath` is `/idp` and `relative` is `device/auth`,
  //  * this would result in `/foo/idp/device/auth`.
  //  */
  // private createRoute(relative: string): string {
  //   return new URL(urljoin(this.baseUrl, this.oidcPath, relative)).pathname;
  // }

  /**
   * Sets up all the IDP routes relative to the IDP path.
   */
  private configureRoutes(config: OidcConfiguration): void {
    if (!config.interactions) {
      config.interactions = {
        url: (_, interaction) => {
          return `/interaction/${interaction.prompt.name}/${interaction.uid}`;
        },
      };
    }

    // config.routes = {
    //   authorization: this.createRoute('auth'),
    //   backchannel_authentication: this.createRoute('backchannel'),
    //   code_verification: this.createRoute('device'),
    //   device_authorization: this.createRoute('device/auth'),
    //   end_session: this.createRoute('session/end'),
    //   introspection: this.createRoute('token/introspection'),
    //   jwks: this.createRoute('jwks'),
    //   pushed_authorization_request: this.createRoute('request'),
    //   registration: this.createRoute('reg'),
    //   revocation: this.createRoute('token/revocation'),
    //   token: this.createRoute('token'),
    //   userinfo: this.createRoute('me'),
    // };
  }

  /**
   * Pipes library errors to the provided ErrorHandler and ResponseWriter.
   */
  private configureErrors(config: OidcConfiguration): void {
    // TODO
    // config.renderError = async(ctx: KoaContextWithOIDC, out: ErrorOut, error: Error): Promise<void> => {
    //   // This allows us to stream directly to the response object, see https://github.com/koajs/koa/issues/944
    //   ctx.respond = false;
    //
    //   // OIDC library hides extra details in this field
    //   if (out.error_description) {
    //     error.message += ` - ${out.error_description}`;
    //   }
    //
    //   const result = await this.errorHandler.handleSafe({ error, preferences: { type: { 'text/plain': 1 }}});
    //   await this.responseWriter.handleSafe({ response: ctx.res, result });
    // };
  }
}
