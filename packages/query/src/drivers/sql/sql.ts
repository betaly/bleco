import {AnyObject} from '@loopback/repository';
/* eslint-disable @typescript-eslint/no-floating-promises, @typescript-eslint/no-explicit-any */
import {Knex} from 'knex';
import {Filter} from '@loopback/filter';
import {Entity, Options} from '@loopback/repository';
import {EntityClass} from '../../types';
import {Orm} from '../../orm';
import {ColumnsResolver, JoinResolver, OrderResolver, WhereResolver} from './resolvers';
import {QuerySession} from '../../session';
import {QueryFilter, QueryWhere} from '../../filter';
import {Driver} from '../../driver';
import {createKnex} from './knex';

const debug = require('debug')('bleco:query:driver:sql');

export class SqlDriver extends Driver {
  protected knex: Knex;
  protected transformers: ClauseTransformers;

  async find<T extends Entity>(
    model: EntityClass<T>,
    filter?: QueryFilter<T>,
    options?: Options,
  ): Promise<AnyObject[]> {
    const transformer = this.transformers.get(model);
    filter = filter ?? {};
    const [qb] = this.buildSelect(model, filter);
    transformer.resolveColumns(qb, filter);
    const s = qb.toSQL();
    if (debug.enabled) {
      debug(`Find with SQL: %s`, s.sql);
      debug(`Parameters: %o`, s.bindings);
    }
    const rows: Record<string, any>[] = await this.orm.execute(s.sql, s.bindings, options);
    return rows.map(row => this.orm.fromRow(model.modelName, row));
  }

  async count<T extends Entity>(
    model: EntityClass<T>,
    where?: QueryWhere<T>,
    options?: Options,
  ): Promise<{count: number}> {
    const [qb, session] = this.buildSelect(model, {where});
    const builder = session.hasRelationJoins() ? this.knex(qb) : qb;
    builder.count('*', {as: 'cnt'});
    const s = builder.toSQL();
    if (debug.enabled) {
      debug(`Count with SQL: %s`, s.sql);
      debug(`Parameters: %o`, s.bindings);
    }
    const data = await this.orm.execute(s.sql, s.bindings, options);
    if (debug.enabled) {
      debug(`Count result: %o`, data);
    }
    return {count: data[0]?.cnt ?? 0};
  }

  protected init() {
    this.knex = createKnex(this.dataSource, this.options);
    this.transformers = new ClauseTransformers(this.orm);
  }

  protected buildSelect<T extends Entity = Entity>(
    model: EntityClass<T>,
    filter?: QueryFilter<T>,
  ): [Knex.QueryBuilder, QuerySession] {
    const transformer = this.transformers.get(model);
    filter = filter ?? {};
    this.applySortPolicy(model, filter);
    const session = new QuerySession();
    const qb = this.knex(this.orm.tableEscaped(model.modelName)).queryContext({skipEscape: true});
    transformer.resolveJoin(qb, filter, session);
    transformer.resolveWhere(qb, filter, session);
    transformer.resolveOrder(qb, filter, session);
    this.resolveLimit(qb, filter);

    if (session.hasRelationJoins()) {
      // groupBy ids to avoid duplication for inner joins
      qb.groupBy(this.orm.idNames(model.modelName).map(id => this.orm.columnEscaped(model.modelName, id, true)));
    }
    return [qb, session];
  }

  protected resolveLimit(qb: Knex.QueryBuilder, filter: Filter) {
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

class ClauseTransformers {
  protected items: Map<string, ClauseTransformer<any>> = new Map();

  constructor(public orm: Orm) {}

  get<T extends Entity = Entity>(model: EntityClass<T>): ClauseTransformer<T> {
    let answer = this.items.get(model.modelName) as ClauseTransformer<T>;
    if (!answer) {
      answer = new ClauseTransformer(model, this.orm);
      this.items.set(model.modelName, answer);
    }
    return answer;
  }
}

class ClauseTransformer<T extends Entity = Entity> {
  readonly columns: ColumnsResolver<T>;
  readonly join: JoinResolver<T>;
  readonly where: WhereResolver<T>;
  readonly order: OrderResolver<T>;

  constructor(public readonly model: EntityClass<T>, public orm: Orm) {
    this.columns = new ColumnsResolver(model, this.orm);
    this.join = new JoinResolver(model, this.orm);
    this.where = new WhereResolver(model, this.orm);
    this.order = new OrderResolver(model, this.orm);
  }

  resolveColumns(qb: Knex.QueryBuilder, filter: QueryFilter<T>) {
    this.columns.resolve(qb, filter);
  }

  resolveJoin(qb: Knex.QueryBuilder, filter: QueryFilter<T>, session: QuerySession) {
    this.join.resolve(qb, filter, session);
  }

  resolveWhere(qb: Knex.QueryBuilder, filter: QueryFilter<T>, session: QuerySession) {
    this.where.resolve(qb, filter, session);
  }

  resolveOrder(qb: Knex.QueryBuilder, filter: QueryFilter<T>, session: QuerySession) {
    this.order.resolve(qb, filter, session);
  }
}
