import {SoftDeleteEntity} from '@bleco/soft-delete';
import {Getter} from '@loopback/context';
import {AnyObject, juggler} from '@loopback/repository';
import {EntityClass, QueryEnhancedTransactionalRepository} from '@bleco/query';
import {DefaultDomainId, DomainLike, OptionsWithDomain} from '../types';
import {resolveDomainId} from '../helpers';

export class AclBaseRepository<
  T extends SoftDeleteEntity,
  ID,
  Relations extends object = {},
  Attrs extends object = AnyObject,
> extends QueryEnhancedTransactionalRepository<T, ID, Relations> {
  constructor(entityClass: EntityClass<T>, dataSource: juggler.DataSource, readonly getDomain?: Getter<DomainLike>) {
    super(entityClass, dataSource);
  }

  async resolveDomainId(options?: OptionsWithDomain): Promise<string> {
    return resolveDomainId((await this.getDomain?.()) ?? options?.domain) ?? DefaultDomainId;
  }

  async resolveAttrs(attrs: Attrs, options?: OptionsWithDomain): Promise<AnyObject> {
    throw new Error('Not implemented');
  }
}
