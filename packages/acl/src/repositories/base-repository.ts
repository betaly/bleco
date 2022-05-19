import {Getter} from '@loopback/context';
import {AnyObject, Entity, juggler, Options} from '@loopback/repository';
import {EntityClass, QueryEnhancedTransactionalRepository} from '@bleco/query';
import {DefaultDomain, DomainAware, DomainLike} from '../types';
import {resolveDomain} from '../helpers';

export class AclBaseRepository<
  T extends Entity,
  ID,
  Relations extends object = {},
  Attrs extends object = AnyObject,
> extends QueryEnhancedTransactionalRepository<T, ID, Relations> {
  constructor(
    entityClass: EntityClass<T>,
    dataSource: juggler.DataSource,
    protected readonly getDomain?: Getter<DomainLike>,
  ) {
    super(entityClass, dataSource);
  }

  async getCurrentDomain(options?: Options): Promise<string> {
    return resolveDomain((await this.getDomain?.()) ?? options?.domain) ?? DefaultDomain;
  }

  resolveProps(attrs: Attrs, defaults?: AnyObject): AnyObject {
    throw new Error('Not implemented');
  }

  async ensureDomain<Target extends DomainAware>(attrs: Target, options?: Options): Promise<Target> {
    attrs.domain = attrs.domain ?? (await this.getCurrentDomain(options));
    return attrs;
  }
}
