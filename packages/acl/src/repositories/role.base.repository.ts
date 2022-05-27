import {AnyObject, Entity, juggler} from '@loopback/repository';
import {EntityClass, QueryEnhancedTransactionalRepository} from '@bleco/query';

export class RoleBaseRepository<
  T extends Entity,
  ID,
  Relations extends object = {},
  Attrs extends object = AnyObject,
> extends QueryEnhancedTransactionalRepository<T, ID, Relations> {
  constructor(entityClass: EntityClass<T>, dataSource: juggler.DataSource) {
    super(entityClass, dataSource);
  }

  resolveProps(attrs: Attrs, defaults?: AnyObject): AnyObject {
    throw new Error('Not implemented');
  }
}
