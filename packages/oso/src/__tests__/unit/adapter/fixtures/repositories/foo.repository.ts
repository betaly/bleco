import {DefaultCrudRepositoryWithQuery} from '@bleco/query';
import {Foo, FooRelations} from '../models/foo.model';
import {BindingScope, inject} from '@loopback/context';
import {juggler} from '@loopback/repository';
import {injectable} from '@loopback/core';

@injectable({scope: BindingScope.SINGLETON})
export class FooRepository extends DefaultCrudRepositoryWithQuery<Foo, typeof Foo.prototype.id, FooRelations> {
  constructor(@inject('datasources.db') dataSource: juggler.DataSource) {
    super(Foo, dataSource);
  }
}
