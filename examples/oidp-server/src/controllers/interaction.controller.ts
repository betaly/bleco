import {Interaction, OidcProvider, OidpBindings} from '@bleco/oidp';
import {inject, service} from '@loopback/core';
import {RequestContext, RestBindings, SchemaObject, api, get, post, requestBody} from '@loopback/rest';
import {assert} from 'tily/assert';

import {TemplatesService} from '../services/templates.service';
import {Credentials, UserService} from '../services/user.service';
import {createInspect} from '../utils';

const debug = require('debug')('bleco:oidp-server:interaction');

const inspect = createInspect();

const CredentialsSchema: SchemaObject = {
  type: 'object',
  required: ['login', 'password'],
  properties: {
    login: {
      type: 'string',
    },
    password: {
      type: 'string',
    },
  },
};

export const CredentialsRequestBody = {
  description: 'The input of login function',
  required: true,
  content: {
    'application/json': {schema: CredentialsSchema},
    'application/x-www-form-urlencoded': {schema: CredentialsSchema},
  },
};

@api({basePath: '/interaction'})
export class InteractionController {
  constructor(
    @inject(OidpBindings.OIDC_PROVIDER)
    private readonly provider: OidcProvider,
    @inject(OidpBindings.INTERACTION)
    private interaction: Interaction,
    @inject(RestBindings.Http.CONTEXT)
    private requestContext: RequestContext,
    @service(TemplatesService)
    private templatesService: TemplatesService,
    @service(UserService)
    private userService: UserService,
  ) {
    this.requestContext.response.set('cache-control', 'no-store');
  }

  @get('/{uid}')
  async loginGet(): Promise<void> {
    try {
      const {prompt, params, uid, session} = await this.interaction.details();
      const client = await this.provider.Client.find(params.client_id as string);

      debug('loginGet', {prompt, params, uid, session});

      let viewFile: string, title: string;
      if (prompt.name === 'login') {
        viewFile = 'login.ejs';
        title = 'Sign in';
      } else if (prompt.name === 'consent') {
        viewFile = 'interaction.ejs';
        title = 'Authorize';
      } else {
        throw new Error(`Unknown prompt name: ${prompt.name}`);
      }

      const page = this.templatesService.renderWithLayout(viewFile, {
        details: prompt.details,
        client,
        params,
        uid,
        title,
        session: session ? inspect(session) : undefined,
        dbg: {
          params: inspect(params),
          prompt: inspect(prompt),
        },
      });

      this.requestContext.response.status(200).contentType('text/html').send(page);
    } catch (err) {
      console.error(err);
      throw err;
    }
  }

  @post('/{uid}/login')
  async loginPost(@requestBody(CredentialsRequestBody) credentials: Credentials) {
    try {
      const {
        prompt: {name},
      } = await this.interaction.details();

      debug('loginPost', {name, credentials});

      assert(name === 'login', 'Only login prompt is allowed in POST /login');

      // ensure the user exists, and the password is correct
      const user = await this.userService.verifyCredentials(credentials);

      const result = {
        login: {
          accountId: user.id.toString(),
        },
      };

      await this.interaction.finished(result, {mergeWithLastSubmission: false});
    } catch (err) {
      console.error(err);
      throw err;
    }
  }

  @post('/{uid}/confirm')
  async confirmPost() {
    try {
      const interactionDetails = await this.interaction.details();
      const {
        prompt: {name, details},
        params,
        session,
      } = interactionDetails;
      const {accountId} = session ?? {};
      assert(name === 'consent', 'Only consent prompt is allowed in POST /confirm');

      let {grantId} = interactionDetails;
      const grant = grantId
        ? await this.provider.Grant.find(grantId)
        : new this.provider.Grant({
            accountId,
            clientId: params.client_id as string,
          });

      assert(grant);

      if (details.missingOIDCScope) {
        grant.addOIDCScope((details.missingOIDCScope as string[]).join(' '));
      }
      if (details.missingOIDCClaims) {
        grant.addOIDCClaims(details.missingOIDCClaims as string[]);
      }
      if (details.missingResourceScopes) {
        for (const [indicator, scopes] of Object.entries(details.missingResourceScopes as Record<string, string[]>)) {
          grant.addResourceScope(indicator, scopes.join(' '));
        }
      }

      grantId = await grant.save();

      const consent: {grantId?: string} = {};
      if (!interactionDetails.grantId) {
        // we don't have to pass grantId to consent, we're just modifying existing one
        consent.grantId = grantId;
      }

      const result = {consent};
      await this.interaction.finished(result, {mergeWithLastSubmission: true});
    } catch (e) {
      console.error(e);
      throw e;
    }
  }

  @get('/{uid}/abort')
  async abort() {
    try {
      const result = {
        error: 'access_denied',
        error_description: 'End-User aborted interaction',
      };
      await this.interaction.finished(result, {mergeWithLastSubmission: false});
    } catch (err) {
      console.error(err);
      throw err;
    }
  }
}
