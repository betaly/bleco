import {TransactionFactory} from '../transaction';
import {Entity, Filter} from '@loopback/repository';
import {FilterWithCustomWhere, ObjectProps, OptionsWithDomain} from '../types';
import {PolicyManager} from '../policy.manager';
import {AclBaseRepository} from '../repositories/base-repository';

export class AclBaseService<T extends Entity, P extends ObjectProps<T>> {
  protected tf: TransactionFactory;

  constructor(public repo: AclBaseRepository<T, string>, public policyManager: PolicyManager) {
    this.tf = new TransactionFactory(this.repo.dataSource);
  }

  protected async resolveFilter(filter: FilterWithCustomWhere<T, P>, options?: OptionsWithDomain): Promise<Filter<T>> {
    const {where, ...others} = filter;
    const resolvedWhere = await this.repo.resolveAttrs(where, options);
    return {where: resolvedWhere, ...others};
  }
}
