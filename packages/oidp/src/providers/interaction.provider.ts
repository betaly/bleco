import {inject, Provider} from '@loopback/context';
import {Request, Response, RestBindings} from '@loopback/rest';
import * as oidc from 'oidc-provider';
import {OidpBindings} from '../keys';
import {Interaction} from '../oidc';

export class InteractionProvider implements Provider<Interaction> {
  constructor(
    @inject(OidpBindings.PROVIDER)
    private provider: oidc.Provider,
    @inject(RestBindings.Http.REQUEST)
    private req: Request,
    @inject(RestBindings.Http.RESPONSE)
    private res: Response,
  ) {}

  value(): Interaction {
    return new Interaction(this.provider, this.req, this.res);
  }
}
