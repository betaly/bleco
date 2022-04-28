/* eslint-disable @typescript-eslint/no-explicit-any */
import PgMock2 from 'pgmock2';
import {ValueOf} from 'ts-essentials';
import {
  BelongsToDefinition,
  createBelongsToInclusionResolver,
  createHasManyInclusionResolver,
  DefaultCrudRepository,
  HasManyDefinition,
  HasOneDefinition,
  juggler,
  Options,
} from '@loopback/repository';
import noop from 'tily/function/noop';
import {ColumnsResolver, JoinResolver, OrderResolver, WhereResolver} from '../drivers/sql/resolvers';
import {Org} from './fixtures/models/org';
import {Proj} from './fixtures/models/proj';
import {Issue} from './fixtures/models/issue';
import {User} from './fixtures/models/user';
import {OrgUser} from './fixtures/models/org-user';
import {UserInfo} from './fixtures/models/user-info';
import {Foo} from './fixtures/models/foo';
import {createHasOneInclusionResolver} from '@loopback/repository/dist/relations/has-one/has-one.inclusion-resolver';
import {createHasManyThroughInclusionResolver} from './helper';

export const EntityMap = {
  Foo: Foo,
  Org: Org,
  Proj: Proj,
  Issue: Issue,
  User: User,
  UserInfo: UserInfo,
  OrgUser: OrgUser,
};

export type EntityMap = typeof EntityMap;

export type EntityName = keyof EntityMap;
export type EntityType = ValueOf<EntityMap>;

export const Entities: EntityType[] = Object.values(EntityMap);

export type Repos = {
  [key in EntityName]: DefaultCrudRepository<any, any>;
};

export interface DB {
  ds: juggler.DataSource;
  repos: Repos;
}

export function givenDb(dsConfig: Options) {
  const ds = new juggler.DataSource(dsConfig);
  const repos = Entities.reduce((acc, entity) => {
    acc[entity.name as EntityName] = new DefaultCrudRepository<any, any>(entity, ds);
    return acc;
  }, {} as Repos);

  Object.entries(repos).forEach(([name, repo]) => {
    const Entity = EntityMap[name as EntityName];
    const definition = Entity.definition;
    for (const relationName in definition.relations) {
      const relation = definition.relations[relationName];
      const targetRepo = repos[relation.target().name as EntityName];
      if (relation.type === 'belongsTo') {
        repo.registerInclusionResolver(
          relationName,
          createBelongsToInclusionResolver(relation as BelongsToDefinition, async () => targetRepo),
        );
      } else if (relation.type === 'hasMany') {
        if ('through' in relation && relation.through) {
          repo.registerInclusionResolver(
            relationName,
            createHasManyThroughInclusionResolver(
              relation as HasManyDefinition,
              async () => repos[relation.through!.model().name as EntityName],
              async () => targetRepo,
            ),
          );
        } else {
          repo.registerInclusionResolver(
            relationName,
            createHasManyInclusionResolver(relation as HasManyDefinition, async () => targetRepo),
          );
        }
      } else if (relation.type === 'hasOne') {
        repo.registerInclusionResolver(
          relationName,
          createHasOneInclusionResolver(relation as HasOneDefinition, async () => targetRepo),
        );
      }
    }
  });

  return {ds, repos};
}

export function givenWhereResolvers(ds: juggler.DataSource) {
  return Entities.reduce((acc, entity) => {
    acc[entity.name] = new WhereResolver<any>(entity, ds);
    return acc;
  }, {} as Record<string, WhereResolver<any>>);
}

export function givenJoinResolvers(ds: juggler.DataSource) {
  return Entities.reduce((acc, entity) => {
    acc[entity.name] = new JoinResolver<any>(entity, ds);
    return acc;
  }, {} as Record<string, JoinResolver<any>>);
}

export function givenOrderResolvers(ds: juggler.DataSource) {
  return Entities.reduce((acc, entity) => {
    acc[entity.name] = new OrderResolver<any>(entity, ds);
    return acc;
  }, {} as Record<string, OrderResolver<any>>);
}

export function givenColumnResolvers(ds: juggler.DataSource) {
  return Entities.reduce((acc, entity) => {
    acc[entity.name] = new ColumnsResolver<any>(entity, ds);
    return acc;
  }, {} as Record<string, ColumnsResolver<any>>);
}

export function filterSpecs(specs: any[]) {
  const filtered = specs.filter(spec => spec.only);
  return filtered.length ? filtered : specs;
}

export function mockPg() {
  const proto = PgMock2.prototype as any;
  if (!proto.__connect__) {
    proto.__connect__ = proto.connect;
    proto.connect = function (cb: (err: Error | undefined, client: PgMock2 | undefined, releaseCb: Function) => void) {
      if (cb) {
        proto.__connect__
          .call(this)
          .then(() => cb(undefined, this, noop))
          .catch((err: Error) => cb(err, undefined, noop));
      } else {
        return proto.__connect__.call(this);
      }
    };
  }

  jest.mock('pg', () => {
    return {
      Client: PgMock2,
      Pool: PgMock2,
    };
  });
}
