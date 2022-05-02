/* eslint-disable @typescript-eslint/no-floating-promises */
import {Knex} from 'knex';
import {Entity} from '@loopback/repository';
import {Filter, isFilter} from '@loopback/filter';
import toArray from 'tily/array/toArray';
import {ClauseResolver} from '../resolver';
import {QuerySession} from '../../../session';
import {assert} from 'tily/assert';

export class OrderResolver<TModel extends Entity> extends ClauseResolver<TModel> {
  resolve(qb: Knex.QueryBuilder<TModel>, filter: Filter<TModel> | string[] | string, session: QuerySession): void {
    const orders = toArray(isFilter(filter) ? filter.order : filter) as string[];
    const relationOrder = session.relationOrder;
    for (const order of orders) {
      const parts = order.split(/[\s,]+/);
      const [key, value] = parts;
      if (relationOrder[key]) {
        const constraint = relationOrder[key];
        assert(constraint.property, `Relation order constraint for key '${key}' is missing property`);
        qb.orderBy(this.orm.columnEscaped(constraint.model, constraint.property.key, true, constraint.prefix), value);
      } else {
        qb.orderBy(this.columnEscaped(key, true), value);
      }
    }
  }
}
