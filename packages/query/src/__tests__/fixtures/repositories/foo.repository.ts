import {Constructor} from '@loopback/core';
import {DefaultCrudRepository, juggler} from '@loopback/repository';
import {mixinSelectQuery} from '../../../decorators';
import {SelectQueryRepository, SelectQueryRepositoryMixin} from '../../../mixins';
import {Foo} from '../models/foo';

export class FooRepositoryWithSelectQueryExtended extends SelectQueryRepositoryMixin<
  Foo,
  typeof Foo.prototype.id,
  {},
  Constructor<DefaultCrudRepository<Foo, typeof Foo.prototype.id>>
>(DefaultCrudRepository) {
  constructor(dataSource: juggler.DataSource) {
    super(Foo, dataSource);
  }
}

@mixinSelectQuery()
export class FooRepositoryWithSelectQueryDecorated extends DefaultCrudRepository<Foo, typeof Foo.prototype.id> {
  constructor(dataSource: juggler.DataSource) {
    super(Foo, dataSource);
  }
}

export interface FooRepositoryWithSelectQueryDecorated extends SelectQueryRepository<Foo> {}

@mixinSelectQuery(true)
export class FooRepositoryWithSelectQueryDecoratedFull extends DefaultCrudRepository<Foo, typeof Foo.prototype.id> {
  constructor(dataSource: juggler.DataSource) {
    super(Foo, dataSource);
  }
}

export interface FooRepositoryWithSelectQueryDecoratedFull extends SelectQueryRepository<Foo> {}
