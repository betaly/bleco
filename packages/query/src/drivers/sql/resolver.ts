import {DefaultOrm, Orm} from '../../orm';
import {Entity, juggler} from '@loopback/repository';
import {isMapper} from '../../utils';
import {EntityClass} from '../../types';
import {Knex} from 'knex';
import {Filter} from '@loopback/filter';
import {QuerySession} from '../../session';

export class ClauseResolver<TModel extends Entity> {
  public readonly orm: Orm;

  constructor(public entityClass: EntityClass<TModel>, orm: Orm | juggler.DataSource) {
    this.orm = isMapper(orm) ? orm : new DefaultOrm(orm);
  }

  resolve(qb: Knex.QueryBuilder<TModel>, filter: Filter<TModel>, session: QuerySession) {
    throw new Error('Not implemented');
  }

  tableEscaped() {
    return this.orm.tableEscaped(this.entityClass.modelName);
  }

  columnEscaped(columnName: string, withTable?: boolean, prefix?: string) {
    return this.orm.columnEscaped(this.entityClass.modelName, columnName, withTable, prefix);
  }
}
