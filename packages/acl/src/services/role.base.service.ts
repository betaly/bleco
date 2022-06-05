import {QueryFilter} from '@bleco/query';
import {AnyObject, Entity, Filter, Options} from '@loopback/repository';
import {PolicyRegistry} from '../policies';
import {RoleBaseRepository} from '../repositories/role.base.repository';
import {TransactionFactory} from '../transaction';
import {QueryWhereExcludingWhere} from '../types';

export class RoleBaseService<T extends Entity> {
  protected tf: TransactionFactory;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  constructor(public repo: RoleBaseRepository<T, any>, public policyRegistry: PolicyRegistry) {
    this.tf = new TransactionFactory(this.repo.dataSource);
  }

  async find(filter?: QueryFilter<T>, options?: Options): Promise<T[]> {
    return this.repo.find(filter as Filter<T>, options);
  }

  async findOne(filter?: QueryFilter<T>, options?: Options): Promise<T | null> {
    return this.repo.findOne(filter as Filter<T>, options);
  }

  async findById(id: string, filter?: QueryWhereExcludingWhere<T>, options?: Options): Promise<T> {
    return this.repo.findById(id, filter, options);
  }

  async findInDomain(domain: string, options?: Options): Promise<T[]>;
  async findInDomain(filter: QueryFilter<T>, domain: string, options?: Options): Promise<T[]>;
  async findInDomain(
    filterOrDomain: QueryFilter<T> | string,
    domainOrOptions?: string | Options,
    options?: Options,
  ): Promise<T[]> {
    let filter: QueryFilter<T>;
    let domain: string | undefined;
    if (typeof filterOrDomain === 'string') {
      domain = filterOrDomain;
      filter = {};
      options = domainOrOptions as Options;
    } else {
      filter = filterOrDomain ?? {};
      domain = domainOrOptions as string;
    }
    if (domain) {
      filter = domainizedFilter<T>(filter, domain);
    }
    return this.repo.find(filter as Filter<T>, options);
  }

  async findOneInDomain(domain: string, options?: Options): Promise<T | null>;
  async findOneInDomain(filter: QueryFilter<T>, domain: string, options?: Options): Promise<T | null>;
  async findOneInDomain(
    filterOrDomain: QueryFilter<T> | string,
    domainOrOptions?: string | Options,
    options?: Options,
  ): Promise<T | null> {
    let filter: QueryFilter<T>;
    let domain: string | undefined;
    if (typeof filterOrDomain === 'string') {
      domain = filterOrDomain;
      filter = {};
      options = domainOrOptions as Options;
    } else {
      filter = filterOrDomain ?? {};
      domain = domainOrOptions as string;
    }
    if (domain) {
      filter = domainizedFilter<T>(filter, domain);
    }
    return this.repo.findOne(filter as Filter<T>, options);
  }
}

export function domainizedFilter<T extends Entity>(filter: QueryFilter<T>, domain: string): QueryFilter<T> {
  filter.where = filter.where ?? {};
  (filter.where as AnyObject).domain = domain;
  return filter;
}
