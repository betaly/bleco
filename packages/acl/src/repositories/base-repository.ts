import {QueryEnhancedTransactionalSoftCrudRepository, SoftDeleteEntity} from '@bleco/soft-delete';
import {Getter} from '@loopback/context';
import {juggler} from '@loopback/repository';
import {DefaultDomainId, DomainLike, ObjectProps, OptionsWithDomain} from '../types';
import {resolveDomainId} from '../helpers';
import {EntityClass} from '@bleco/query';

export class AclBaseRepository<
  T extends SoftDeleteEntity,
  ID,
  Relations extends object = {},
  Attrs extends ObjectProps<T> = ObjectProps<T>,
> extends QueryEnhancedTransactionalSoftCrudRepository<T, ID, Relations> {
  constructor(entityClass: EntityClass<T>, dataSource: juggler.DataSource, readonly getDomain?: Getter<DomainLike>) {
    super(entityClass, dataSource);
  }

  async resolveDomainId(options?: OptionsWithDomain): Promise<string> {
    return resolveDomainId((await this.getDomain?.()) ?? options?.domain) ?? DefaultDomainId;
  }

  async resolveAttrs(attrs: Attrs, options?: OptionsWithDomain): Promise<ObjectProps<T>> {
    throw new Error('Not implemented');
  }
}
