import {RepositoryFactory} from '@bleco/repo';
import {AnyObject, Entity, Where, WhereBuilder} from '@loopback/repository';
import debugFactory from 'debug';
import {Adapter, Datum, Filter, FilterCondition, Projection} from 'oso';
import {Immediate, isProjection} from 'oso/dist/src/filter';
import {PolarComparisonOperator, UserType} from 'oso/dist/src/types';
import isEmpty from 'tily/is/empty';
import {inspect} from 'util';

import {AuthorizedFilter} from './types';

const debug = debugFactory('bleco:oso:juggler');

const Ops: {[K in PolarComparisonOperator]: keyof WhereBuilder} = {
  Eq: 'eq',
  Neq: 'neq',
  Lt: 'lt',
  Leq: 'lte',
  Gt: 'gt',
  Geq: 'gte',
};

interface FilterRelation {
  fromTypeName: string;
  fromFieldName: string;
  toTypeName: string;
}

interface ResolvedFilterRelation extends FilterRelation {
  parent: ResolvedFilterRelation | null;
}

export class JugglerAdapter<T extends Entity = Entity> implements Adapter<AuthorizedFilter<T>, T> {
  constructor(public repositoryFactory: RepositoryFactory) {}

  async executeQuery(filter: AuthorizedFilter<T>): Promise<T[]> {
    debug('executeQuery with resource filter', inspect(filter, {depth: null, colors: true}));
    const repo = await this.repositoryFactory.getRepository<T>(filter.model);
    return repo.find({where: filter.where as Where});
  }

  buildQuery({model, conditions, relations, types}: Filter): AuthorizedFilter<T> {
    debug('buildQuery - oso filter', inspect({model, conditions, relations}, {depth: null, colors: true}));

    const resolvedRelations = resolveRelations(model, relations);
    debug('buildQuery - resolved relations', inspect(resolvedRelations, {depth: null, colors: true}));

    const relationKeys = buildRelationKeys(resolvedRelations);
    debug('buildQuery - resolved relation keys', inspect(relationKeys, {depth: null, colors: true}));

    const b = new WhereBuilder();

    if (!isEmpty(relationKeys)) {
      b.impose(
        // left join -> inner join
        Object.keys(relationKeys).reduce((acc, type) => {
          const idProp = getIdProp(types.get(type) as UserType<typeof Entity>);
          acc[`${relationKeys[type]}.${idProp}`] = {neq: null};
          return acc;
        }, {} as Record<string, AnyObject>),
      );
    }

    const compactWhere = buildCompactConditions(
      'or',
      conditions.map(ands => {
        return buildCompactConditions(
          'and',
          ands.map(c => {
            const {lhs, cmp, rhs} = normalizeCondition(c, types.get(model) as UserType<typeof Entity>);
            return {$expr: {[Ops[cmp]]: [queryParam(lhs), queryParam(rhs)]}};
          }),
        );
      }),
    );

    if (compactWhere) {
      b.impose(compactWhere);
    }

    function queryParam(d: Datum): unknown {
      if (isProjection(d)) {
        return buildProjectionKey(model, d, relationKeys);
      }
      return d.value;
    }

    const answer = {model, where: b.build()};
    debug('buildQuery - result', inspect(answer, {depth: null, colors: true}));
    return answer;
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function buildCompactConditions(type: 'and' | 'or', conditions: any) {
  if (isEmpty(conditions)) {
    return;
  }

  if (Array.isArray(conditions) && conditions.length === 1) {
    conditions = conditions[0];
  }

  if (Array.isArray(conditions)) {
    return {[type]: conditions};
  } else {
    return conditions;
  }
}

// Expand conditions like "user = #<user id=12>" to "user.id = 12"
// Only the ORM knows how to do this, so we need to do it here.
function normalizeCondition(c: FilterCondition, type: UserType<typeof Entity>): FilterCondition {
  for (const {a, b} of [
    {a: 'lhs', b: 'rhs'},
    {a: 'rhs', b: 'lhs'},
  ] as {a: 'lhs' | 'rhs'; b: 'lhs' | 'rhs'}[]) {
    const q: Datum = c[a];
    if (isProjection(q) && q.fieldName === undefined) {
      const idProp = getIdProp(type);
      c = {
        [a]: {typeName: q.typeName, fieldName: idProp},
        // should always be eq or neq
        cmp: c.cmp,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        [b]: {value: ((c[b] as Immediate).value as any)[idProp]},
      } as unknown as FilterCondition;
    }
  }
  return c;
}

function resolveRelations(model: string, relations: FilterRelation[]): ResolvedFilterRelation[] {
  const answer = relations.map(r => ({...r})) as ResolvedFilterRelation[];
  for (const r of answer) {
    if (r.parent !== undefined) {
      continue;
    }
    if (r.fromTypeName === model) {
      r.parent = null;
      continue;
    }
    const parent = answer.find(r2 => r2.toTypeName === r.fromTypeName);
    if (!parent) {
      throw new Error(`Could not find parent of "${r.fromTypeName}"`);
    }
    r.parent = parent;
  }

  return answer;
}

function buildRelationKeys(relations: ResolvedFilterRelation[]) {
  function buildRelationKey(relation: ResolvedFilterRelation): string {
    if (relation.parent) {
      return `${buildRelationKey(relation.parent)}.${relation.fromFieldName}`;
    }
    return relation.fromFieldName;
  }

  return relations.reduce((map, r) => {
    map[r.toTypeName] = buildRelationKey(r);
    return map;
  }, {} as Record<string, string>);
}

function buildProjectionKey(model: string, projection: Projection, keys: Record<string, string>) {
  if (isProjection(projection)) {
    if (model === projection.typeName) {
      return `$${projection.fieldName}`;
    }
    if (!keys[projection.typeName]) {
      throw new Error(`Could not find relation key for "${projection.typeName}"`);
    }
    return `$${keys[projection.typeName]}.${projection.fieldName}`;
  }
}

export function getIdProp(type: UserType<typeof Entity>) {
  const idProps = type.cls.definition.idProperties();
  if (idProps.length !== 1) {
    throw new Error(`Expected one id property but found ${idProps.length}`);
  }
  return idProps[0];
}
