import {BindingScope, inject} from '@loopback/context';
import {injectable} from '@loopback/core';
import {juggler} from '@loopback/repository';
import {QueryEnhancedCrudRepository} from 'loopback4-query';

import {Foo, FooRelations} from '../models/foo.model';

@injectable({scope: BindingScope.SINGLETON})
export class FooRepository extends QueryEnhancedCrudRepository<Foo, typeof Foo.prototype.id, FooRelations> {
  constructor(@inject('datasources.db') dataSource: juggler.DataSource) {
    super(Foo, dataSource);
  }
}
