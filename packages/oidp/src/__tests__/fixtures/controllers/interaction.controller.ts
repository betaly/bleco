import {inject} from '@loopback/context';
import {Response, RestBindings, api, get, post, requestBody} from '@loopback/rest';
import {InteractionResults} from 'oidc-provider';

import {OidpBindings} from '../../../keys';
import {InteractionOperations} from '../../../oidc';
import {OidcProvider} from '../../../types';
import {InteractionDetails} from '../../../types/oidc.types';

interface LoginForm {
  user: string;
  pwd: string;
}

@api({basePath: '/interaction'})
export class InteractionController {
  constructor(
    @inject(OidpBindings.OIDC_PROVIDER)
    private readonly provider: OidcProvider,
    @inject(OidpBindings.INTERACTION)
    private readonly interaction: InteractionOperations,
    @inject(RestBindings.Http.RESPONSE)
    private readonly response: Response,
  ) {}

  @get('/{uid}')
  async loginGet(): Promise<InteractionDetails> {
    return this.interaction.details();
  }

  @post('/{uid}/login')
  async loginPost(@requestBody() loginForm: LoginForm): Promise<void> {
    await this.interaction.details();

    const {user} = loginForm;

    const result: InteractionResults = {
      login: {
        accountId: user,
      },
    };

    await this.interaction.finished(result, {
      mergeWithLastSubmission: false,
    });
  }

  @post('/{uid}/confirm')
  async consentConfirm(): Promise<void> {
    const {prompt, params, session} = await this.interaction.details();

    const grant = new this.provider.Grant({
      accountId: session!.accountId,
      clientId: params.client_id as string,
    });

    if (prompt.details.missingOIDCScope) {
      const scopes = prompt.details.missingOIDCScope as string[];
      grant.addOIDCScope(scopes.join(' '));
    }

    const grantId = await grant.save();

    const result: InteractionResults = {
      consent: {
        grantId,
      },
    };

    const returnTo = await this.interaction.result(result, {
      mergeWithLastSubmission: true,
    });

    this.response.redirect(returnTo);
  }
}
