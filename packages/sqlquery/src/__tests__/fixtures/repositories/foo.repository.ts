import {Constructor} from '@loopback/core';
import {DefaultCrudRepository, juggler} from '@loopback/repository';
import {ObjectQueryRepositoryMixin} from '../../../mixins';
import {Foo} from '../models/foo';

export class FooRepository extends ObjectQueryRepositoryMixin<
  Foo,
  typeof Foo.prototype.id,
  {},
  Constructor<DefaultCrudRepository<Foo, typeof Foo.prototype.id>>
>(DefaultCrudRepository) {
  constructor(dataSource: juggler.DataSource) {
    super(Foo, dataSource);
  }
}
