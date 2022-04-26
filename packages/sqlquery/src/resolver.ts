import {DefaultMapper, Mapper} from './mapper';
import {Entity, juggler} from '@loopback/repository';
import {isMapper} from './utils';
import {EntityClass} from './types';
import {Knex} from 'knex';
import {Filter} from '@loopback/filter';
import {QuerySession} from './session';

export class ClauseResolver<TModel extends Entity> {
  public readonly mapper: Mapper;

  constructor(public entityClass: EntityClass<TModel>, mapper: Mapper | juggler.DataSource) {
    this.mapper = isMapper(mapper) ? mapper : new DefaultMapper(mapper);
  }

  resolve(qb: Knex.QueryBuilder<TModel>, filter: Filter<TModel>, session: QuerySession) {
    throw new Error('Not implemented');
  }

  tableEscaped() {
    return this.mapper.tableEscaped(this.entityClass.modelName);
  }

  columnEscaped(columnName: string, withTable?: boolean, prefix?: string) {
    return this.mapper.columnEscaped(this.entityClass.modelName, columnName, withTable, prefix);
  }
}
