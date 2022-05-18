import {TransactionFactory} from '../transaction';
import {AnyObject, Entity, Filter, Where} from '@loopback/repository';
import {FilterWithCustomWhere, OptionsWithDomain} from '../types';
import {PolicyManager} from '../policy.manager';
import {AclBaseRepository} from '../repositories/base-repository';

export class AclBaseService<T extends Entity, P extends object = AnyObject> {
  protected tf: TransactionFactory;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  constructor(public repo: AclBaseRepository<T, any>, public policyManager: PolicyManager) {
    this.tf = new TransactionFactory(this.repo.dataSource);
  }

  protected async resolveFilter(filter: FilterWithCustomWhere<T, P>, options?: OptionsWithDomain): Promise<Filter<T>> {
    const {where, ...others} = filter;
    const props = await this.repo.resolveAttrs(where, options);
    return {where: props as Where, ...others};
  }
}
