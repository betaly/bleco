import {EntityClass, QueryEnhancedTransactionalRepository} from 'loopback4-query';
import {AnyObject, Entity, juggler} from '@loopback/repository';

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
