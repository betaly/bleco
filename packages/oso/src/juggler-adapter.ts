import {Entity, EntityCrudRepository, WhereBuilder} from '@loopback/repository';
import {Application} from '@loopback/core';
import {Adapter, Datum, Filter, FilterCondition, Projection} from 'oso';
import debugFactory from 'debug';
import {ResourceFilter} from './types';
import {OsoBindings} from './keys';
import {inspect} from 'util';
import {Immediate, isProjection} from 'oso/dist/src/filter';
import {PolarComparisonOperator, UserType} from 'oso/dist/src/types';
import isEmpty from 'tily/is/empty';
import {getIdProp} from './oso.helper';

const debug = debugFactory('bleco:oso:juggler-adapter');

const Ops: {[K in PolarComparisonOperator]: keyof WhereBuilder} = {
  Eq: 'eq',
  Neq: 'neq',
  Lt: 'lt',
  Leq: 'lte',
  Gt: 'gt',
  Geq: 'gte',
};

interface OsoFilterRelation {
  fromTypeName: string;
  fromFieldName: string;
  toTypeName: string;
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

interface OsoResolvedFilterRelation extends OsoFilterRelation {
  parent: OsoResolvedFilterRelation | null;
}

function resolveRelations(model: string, relations: OsoFilterRelation[]): OsoResolvedFilterRelation[] {
  const answer = relations.map(r => ({...r})) as OsoResolvedFilterRelation[];
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

function buildRelationKeys(relations: OsoResolvedFilterRelation[]) {
  function buildRelationKey(relation: OsoResolvedFilterRelation): string {
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

export class OsoJugglerAdapter<T extends Entity = Entity> implements Adapter<ResourceFilter<T>, T> {
  constructor(public app: Application) {}

  async executeQuery(filter: ResourceFilter<T>): Promise<T[]> {
    debug('executeQuery with resource filter', inspect(filter, {depth: null, colors: true}));
    const repo = await this.findRepository(filter.model);
    return repo.find({where: filter.where});
  }

  buildQuery({model, conditions, relations, types}: Filter): ResourceFilter<T> {
    debug('buildQuery with oso filter', inspect({model, conditions, relations}, {depth: null, colors: true}));

    const resolvedRelations = resolveRelations(model, relations);
    debug('resolved relations', inspect(resolvedRelations, {depth: null, colors: true}));

    const relationKeys = buildRelationKeys(resolvedRelations);
    debug('resolved relation keys', inspect(relationKeys, {depth: null, colors: true}));

    const b = new WhereBuilder();

    if (!isEmpty(relationKeys)) {
      b.and({$rel: Object.values(relationKeys)});
    }

    b.or(
      conditions.map(ands => ({
        and: ands.map(c => {
          const {lhs, cmp, rhs} = normalizeCondition(c, types.get(model) as UserType<typeof Entity>);
          return {$expr: {[Ops[cmp]]: [queryParam(lhs), queryParam(rhs)]}};
        }),
      })),
    );

    function queryParam(d: Datum): unknown {
      if (isProjection(d)) {
        return buildProjectionKey(model, d, relationKeys);
      }
      return d.value;
    }

    return {model, where: b.build()};
  }

  protected async findRepository(model: string): Promise<EntityCrudRepository<T, unknown>> {
    const oso = await this.app.get(OsoBindings.AUTHORIZER);
    return (await oso.getRepository(model)) as EntityCrudRepository<T, unknown>;
  }
}
