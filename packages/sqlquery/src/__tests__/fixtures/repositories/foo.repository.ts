import {Constructor} from '@loopback/core';
import {DefaultCrudRepository, juggler} from '@loopback/repository';
import {mixinObjectQuery} from '../../../decorators';
import {ObjectQueryRepository, ObjectQueryRepositoryMixin} from '../../../mixins';
import {Foo} from '../models/foo';

export class FooRepositoryWithObjectQueryExtended extends ObjectQueryRepositoryMixin<
  Foo,
  typeof Foo.prototype.id,
  {},
  Constructor<DefaultCrudRepository<Foo, typeof Foo.prototype.id>>
>(DefaultCrudRepository) {
  constructor(dataSource: juggler.DataSource) {
    super(Foo, dataSource);
  }
}

@mixinObjectQuery()
export class FooRepositoryWithObjectQueryDecorated extends DefaultCrudRepository<Foo, typeof Foo.prototype.id> {
  constructor(dataSource: juggler.DataSource) {
    super(Foo, dataSource);
  }
}

export interface FooRepositoryWithObjectQueryDecorated extends ObjectQueryRepository<Foo> {}

@mixinObjectQuery(true)
export class FooRepositoryWithObjectQueryDecoratedFull extends DefaultCrudRepository<Foo, typeof Foo.prototype.id> {
  constructor(dataSource: juggler.DataSource) {
    super(Foo, dataSource);
  }
}

export interface FooRepositoryWithObjectQueryDecoratedFull extends ObjectQueryRepository<Foo> {}
