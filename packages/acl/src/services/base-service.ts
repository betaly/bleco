import {TransactionFactory} from '../transaction';
import {Entity, Filter, Options, Where} from '@loopback/repository';
import {DomainAware} from '../types';
import {PolicyManager} from '../policy.manager';
import {AclBaseRepository} from '../repositories/base-repository';
import {FilterExcludingWhere} from '@loopback/filter';

export class AclBaseService<T extends Entity> {
  protected tf: TransactionFactory;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  constructor(public repo: AclBaseRepository<T, any>, public policyManager: PolicyManager) {
    this.tf = new TransactionFactory(this.repo.dataSource);
  }

  async find(filter?: Filter<T>, options?: Options): Promise<T[]> {
    return this.repo.find(await this.domainizedFilter(filter, options), options);
  }

  async findOne(filter: Filter<T>, options?: Options): Promise<T | null> {
    return this.repo.findOne(await this.domainizedFilter(filter, options), options);
  }

  async findById(id: string, filter?: FilterExcludingWhere<T>, options?: Options): Promise<T> {
    return this.repo.findById(id, filter, options);
  }

  protected async domainizedFilter(filter?: Filter<T>, options?: Options): Promise<Filter<T>> {
    filter = filter ?? {};
    filter.where = await this.domainizedWhere(filter.where, options);
    return filter;
  }

  protected async domainizedWhere(where?: Where<T>, options?: Options): Promise<Where<T>> {
    where = where ?? {};
    (where as DomainAware).domain = await this.repo.getCurrentDomain(options);
    return where;
  }
}
