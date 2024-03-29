import {AnyObject, Entity, juggler} from '@loopback/repository';
import {EntityClass, QueryEnhancedTransactionalCrudRepository} from 'loopback4-query';

export class RoleBaseRepository<
  T extends Entity,
  ID,
  Relations extends object = {},
  Attrs extends object = AnyObject,
> extends QueryEnhancedTransactionalCrudRepository<T, ID, Relations> {
  constructor(entityClass: EntityClass<T>, dataSource: juggler.DataSource) {
    super(entityClass, dataSource);
  }

  resolveProps(attrs: Attrs, defaults?: AnyObject): AnyObject {
    throw new Error('Not implemented');
  }
}
