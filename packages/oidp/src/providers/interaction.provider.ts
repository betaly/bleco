import {Provider, inject} from '@loopback/context';
import {Request, Response, RestBindings} from '@loopback/rest';
import OidcProvider from 'oidc-provider';

import {OidpBindings} from '../keys';
import {InteractionOperations} from '../oidc';

export class InteractionProvider implements Provider<InteractionOperations> {
  constructor(
    @inject(OidpBindings.OIDC_PROVIDER)
    private provider: OidcProvider,
    @inject(RestBindings.Http.REQUEST)
    private req: Request,
    @inject(RestBindings.Http.RESPONSE)
    private res: Response,
  ) {}

  value(): InteractionOperations {
    return new InteractionOperations(this.provider, this.req, this.res);
  }
}
