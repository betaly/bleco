import {BindingScope, injectable, Provider} from '@loopback/context';
import {repository} from '@loopback/repository';
import {AdapterFactory} from 'oidc-provider';
import {DbAdapter} from '../adapters';
import {OidcRepository} from '../repositories';

@injectable({scope: BindingScope.SINGLETON})
export class DbAdapterFactoryProvider implements Provider<AdapterFactory> {
  constructor(
    @repository(OidcRepository)
    private readonly repo: OidcRepository,
  ) {}

  value(): AdapterFactory {
    return (model: string) => new DbAdapter(model, this.repo);
  }
}
