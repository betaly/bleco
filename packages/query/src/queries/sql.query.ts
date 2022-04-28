/* eslint-disable @typescript-eslint/no-floating-promises, @typescript-eslint/no-explicit-any */
import {Knex} from 'knex';
import {Filter} from '@loopback/filter';
import {Entity, includeRelatedModels, Options} from '@loopback/repository';
import {ColumnsResolver, JoinResolver, OrderResolver, WhereResolver} from '../resolvers';
import {QuerySession} from '../session';
import {AbstractQuery} from './query';
import {QueryFilter, QueryWhere} from '../filter';

const debug = require('debug')('bleco:query:sql-query');

export class SqlQuery<T extends Entity, Relations extends object = {}> extends AbstractQuery<T, Relations> {
  protected columnsResolver: ColumnsResolver<T>;
  protected joinResolver: JoinResolver<T>;
  protected whereResolver: WhereResolver<T>;
  protected orderResolver: OrderResolver<T>;

  async count(where?: QueryWhere<T>, options?: Options) {
    const [qb, session] = this.buildSelect({where});
    const builder = session.hasRelationJoins() ? this.knex(qb) : qb;
    builder.count('*', {as: 'cnt'});
    const s = builder.toSQL();
    if (debug.enabled) {
      debug(`Count with SQL: %s`, s.sql);
      debug(`Parameters: %o`, s.bindings);
    }
    const data = await this.mapper.execute(s.sql, s.bindings, options);
    if (debug.enabled) {
      debug(`Count result: %o`, data);
    }
    return {count: data[0]?.cnt ?? 0};
  }

  async find(filter?: QueryFilter<T>, options?: Options): Promise<(T & Relations)[]> {
    filter = filter ?? {};
    const [qb] = this.buildSelect(filter);
    this.columnsResolver.resolve(qb, filter);
    const s = qb.toSQL();
    if (debug.enabled) {
      debug(`Find with SQL: %s`, s.sql);
      debug(`Parameters: %o`, s.bindings);
    }
    const rows: Record<string, any>[] = await this.mapper.execute(s.sql, s.bindings, options);
    const entities = this.toEntities(rows.map(row => this.mapper.fromRow(this.entityClass.modelName, row)));
    if (this.repo) {
      return includeRelatedModels(this.repo, entities, filter.include, options);
    }
    return entities as (T & Relations)[];
  }

  async findOne(filter?: QueryFilter<T>, options?: Options): Promise<(T & Relations) | null> {
    filter = filter ?? {};
    filter.limit = 1;
    const result = await this.find(filter, options);
    return result[0] ?? null;
  }

  protected init() {
    this.columnsResolver = new ColumnsResolver(this.entityClass, this.mapper);
    this.joinResolver = new JoinResolver(this.entityClass, this.mapper);
    this.whereResolver = new WhereResolver(this.entityClass, this.mapper);
    this.orderResolver = new OrderResolver(this.entityClass, this.mapper);
  }

  protected buildSelect(filter?: Filter<T>): [Knex.QueryBuilder, QuerySession] {
    filter = filter ?? {};
    this.applySortPolicy(filter);
    const session = new QuerySession();
    const qb = this.knex(this.mapper.tableEscaped(this.entityClass.modelName)).queryContext({skipEscape: true});
    this.joinResolver.resolve(qb, filter, session);
    this.whereResolver.resolve(qb, filter, session);
    this.orderResolver.resolve(qb, filter, session);
    this.resolveLimit(qb, filter);

    if (session.hasRelationJoins()) {
      // groupBy ids to avoid duplication for inner joins
      qb.groupBy(
        this.mapper
          .idNames(this.entityClass.name)
          .map(id => this.mapper.columnEscaped(this.entityClass.name, id, true)),
      );
    }
    return [qb, session];
  }

  protected resolveLimit(qb: Knex.QueryBuilder, filter: Filter<T>) {
    let limit = filter.limit;
    let offset = filter.skip ?? filter.offset;

    if (isNaN(limit ?? 0)) {
      limit = 0;
    }
    if (isNaN(offset ?? 0)) {
      offset = 0;
    }
    if (!limit && !offset) {
      return;
    }

    if (limit) {
      qb.limit(limit);
    }
    if (offset) {
      qb.offset(offset);
    }
  }
}
