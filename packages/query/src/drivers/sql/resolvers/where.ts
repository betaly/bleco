/* eslint-disable @typescript-eslint/no-floating-promises, @typescript-eslint/no-misused-promises, @typescript-eslint/no-explicit-any, @typescript-eslint/no-shadow */
import {Knex} from 'knex';
import debugFactory from 'debug';
import isArray from 'tily/is/array';
import isEmpty from 'tily/is/empty';
import isObject from 'tily/is/object';
import each from 'tily/object/each';
import isPlainObject from 'tily/is/plainObject';
import {PickKeys} from 'ts-essentials';
import {Filter, isFilter, Operators, Where} from '@loopback/filter';
import {Entity, juggler, PropertyDefinition} from '@loopback/repository';
import {EntityClass, WhereValue} from '../../../types';
import {ClauseResolver} from '../resolver';
import {Orm} from '../../../orm';
import {compactWhere, isField, isNested} from '../../../utils';
import {QuerySession} from '../../../session';
import {RelationConstraint} from '../../../relation';

const debug = debugFactory('bleco:query:where');

export type FieldOperators = Operators | '!' | '=' | '!=' | '<' | '<=' | '>' | '>=' | 'in' | 'not';

export const GroupOperators = ['and', 'or', 'not', '!', 'related'];

export type OperatorHandler = (
  this: WhereResolver<any>,
  qb: Knex.QueryBuilder,
  condition: Condition,
  session: QuerySession,
) => void;

interface Condition {
  key: string;
  op: string;
  value: WhereValue;
  expression: unknown;
}

export class OperatorHandlerRegistry {
  readonly handlers: {[key: string]: OperatorHandler} = {};

  constructor() {
    this.init();
  }

  init() {
    this.register('=', this.eq());
    this.register('!=', this.comparison('!='));
    this.register('<', this.comparison('<'));
    this.register('<=', this.comparison('<='));
    this.register('>', this.comparison('>'));
    this.register('>=', this.comparison('>='));
    this.register('!', this.not());
    this.register('eq', this.eq());
    this.register('neq', this.comparison('!='));
    this.register('lt', this.comparison('<'));
    this.register('lte', this.comparison('<='));
    this.register('gt', this.comparison('>'));
    this.register('gte', this.comparison('>='));
    this.register('not', this.not());
    this.register('in', this.whereFn('whereIn', true));
    this.register('inq', this.whereFn('whereIn', true));
    this.register('nin', this.whereFn('whereNotIn', true));
    this.register('between', this.whereFn('whereBetween', true));
    this.register('like', this.whereFn('whereLike'));
    this.register('nlike', this.comparison('not like'));
    this.register('ilike', this.whereFn('whereILike'));
    this.register('nilike', this.comparison('not ilike'));
    this.register('or', this.logical('orWhere'));
    this.register('and', this.logical('where'));
  }

  register(operator: FieldOperators, handler: OperatorHandler): void {
    this.handlers[operator] = handler;
  }

  get(operator: string): OperatorHandler {
    const h = this.handlers[operator];
    if (!h) {
      throw new Error(`Operator "${operator}" is not supported`);
    }
    return h;
  }

  eq(): OperatorHandler {
    return (qb: Knex.QueryBuilder, condition: Condition) => {
      debug('- eq:', condition);
      const {key, value} = condition;
      if (isField(key)) {
        if (value == null) {
          qb.whereNull(key);
        } else {
          qb.where(key, '=', value);
        }
      } else {
        qb.whereRaw(key, value);
      }
    };
  }

  comparison(operator: string): OperatorHandler {
    return (qb: Knex.QueryBuilder, condition: Condition) => {
      debug('- comparison:', condition);
      const {key, value} = condition;
      qb.where(key, operator, value);
    };
  }

  not(): OperatorHandler {
    return function (this: WhereResolver<any>, qb: Knex.QueryBuilder, condition: Condition, session: QuerySession) {
      debug('- not:', condition);
      const {value} = condition;
      qb.whereNot(qb => this.build(qb, value, session));
    };
  }

  whereFn(op: PickKeys<Knex.QueryBuilder, Function>, ignoreEmptyArray?: boolean): OperatorHandler {
    return function (qb: Knex.QueryBuilder, condition: Condition) {
      debug('- whereOp:', op, condition);
      const {key, value} = condition;
      if (ignoreEmptyArray) {
        if (!isArray(value) || isEmpty(value)) {
          debug('- whereOp(array): empty array');
          return;
        }
      }
      (qb[op] as Function)(key, value);
    };
  }

  logical(op: 'where' | 'orWhere'): OperatorHandler {
    return function (this: WhereResolver<any>, qb: Knex.QueryBuilder, condition: Condition, session: QuerySession) {
      debug('- logical:', op, condition);
      const {value} = condition;
      if (isArray(value)) {
        if (isEmpty(value)) {
          debug('- logical(array): empty array');
          return;
        }
        debug('- logical: resolving orWhere for array value');
        qb.where(qb => value.forEach(v => qb[op](qb => this.build(qb, v, session))));
        return;
      }
      if (!isObject(value)) {
        debug('- logical: value is not object');
        return;
      }
      if (op === 'where') {
        debug('- logical: resolving where');
        return this.build(qb, value, session);
      }
      debug('- logical: resolving orWhere for object value');
      qb.where(qb => {
        each((v, k) => qb[op](qb => this.build(qb, {[k]: v}, session)), value);
      });
    };
  }
}

export const DefaultOperatorHandlerRegistry = new OperatorHandlerRegistry();

export class WhereResolver<TModel extends Entity> extends ClauseResolver<TModel> {
  constructor(
    entityClass: EntityClass<TModel>,
    orm: Orm | juggler.DataSource,
    public registry: OperatorHandlerRegistry = DefaultOperatorHandlerRegistry,
  ) {
    super(entityClass, orm);
  }

  resolve(qb: Knex.QueryBuilder<TModel>, filter: Filter<TModel> | Where<TModel>, session: QuerySession): void {
    const where = isFilter(filter) ? filter.where : filter;
    if (!where) {
      debug('No where clause, skip resolving');
      return;
    }
    debug(`Resolving where clause for model ${this.entityClass.modelName}:`, where, session);
    this.build(qb, where, session ?? new QuerySession());
  }

  build(qb: Knex.QueryBuilder<TModel>, where: Where<TModel>, session: QuerySession): void {
    debug(`- build: building where clause for model ${this.entityClass.modelName}:`, where);
    each((v, k) => {
      const condition = parseCondition(k, v);
      debug('- build: parsed clause:', condition);
      this.invoke(qb, condition, session);
    }, compactWhere(where));
  }

  protected invoke(qb: Knex.QueryBuilder, condition: Condition, session: QuerySession): void {
    let {key, op} = condition;
    // skip escape
    qb.queryContext({skipEscape: true});

    // check is property for equality operation
    // support whereRaw with like: {'? = ?': [1, 2]}
    if (key && (isField(key) || op !== '=')) {
      const {relationWhere} = session;
      const {definition} = this.entityClass;

      key = (() => {
        const props = definition.properties;
        if (props) {
          let constraint: RelationConstraint | undefined;
          let p: PropertyDefinition | undefined = props[key];

          // TODO we should ignore hidden property for `where`?
          // if (p && includes(key, definition.settings.hiddenProperties ?? [])) {
          //   debug('Hidden prop for model %s skipping', definition.name);
          //   return '';
          // }

          if (p == null && isNested(key)) {
            // See if we are querying nested json
            p = props[key.split('.')[0]];
          }

          // It may be an innerWhere
          if (p == null) {
            constraint = relationWhere?.[key];
            if (constraint && !constraint.property) {
              debug('Ignore relation where with key "%s" for no property provided', key);
              return '';
            }
            p = constraint?.property;
          }

          if (p == null) {
            // Unknown property, ignore it
            debug('Unknown key "%s" is skipped for model "%s"', key, this.entityClass.modelName);
            return '';
          }

          return constraint
            ? this.orm.columnEscaped(constraint.model, p.key, true, constraint.prefix)
            : this.columnEscaped(key, session.hasRelationWhere());
        }

        return key;
      })();

      if (!key) {
        // skip unknown key
        return;
      }
    }

    this.registry.get(op).call(this, qb, {...condition, key}, session);
  }
}

function parseCondition(key: string, expression: unknown): Condition {
  if (expression === null) {
    return {key, op: '=', value: expression, expression};
  }
  if (GroupOperators.includes(key)) {
    return {key: '', op: key, value: expression, expression};
  }
  if (isPlainObject(expression)) {
    const op = Object.keys(expression)[0];
    return {key, op, value: expression[op], expression};
  }
  return {key, op: '=', value: expression, expression};
}
