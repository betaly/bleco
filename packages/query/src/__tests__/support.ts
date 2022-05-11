/* eslint-disable @typescript-eslint/no-explicit-any */
import PgMock2 from 'pgmock2';
import {ValueOf} from 'ts-essentials';
import {
  BelongsToDefinition,
  createBelongsToInclusionResolver,
  createHasManyInclusionResolver,
  DefaultCrudRepository,
  Entity,
  HasManyDefinition,
  HasOneDefinition,
  juggler,
  Options,
} from '@loopback/repository';
import noop from 'tily/function/noop';
import {createHasOneInclusionResolver} from '@loopback/repository/dist/relations/has-one/has-one.inclusion-resolver';
import {createHasManyThroughInclusionResolver} from '@loopback/repository/dist/relations/has-many/has-many-through.inclusion-resolver';
import {ColumnsResolver, JoinResolver, OrderResolver, WhereResolver} from '../drivers';
import {DefaultQuery, Query} from '../query';
import {EntityClass} from '../types';
import {Org} from './fixtures/models/org';
import {Proj} from './fixtures/models/proj';
import {Issue} from './fixtures/models/issue';
import {User} from './fixtures/models/user';
import {OrgUser} from './fixtures/models/org-user';
import {UserInfo} from './fixtures/models/user-info';
import {Foo} from './fixtures/models/foo';
import {Bar} from './fixtures/models/bar';
import {Letter, Parcel} from './fixtures/models/deliverable';
import {Delivery} from './fixtures/models/delivery';
import {Transport} from './fixtures/models/transport';
import {Sender} from './fixtures/models/sender';
import {SenderDeliverable} from './fixtures/models/sender-deliverable';

export const EntityMap = {
  Foo: Foo,
  Bar: Bar,
  Org: Org,
  Proj: Proj,
  Issue: Issue,
  User: User,
  UserInfo: UserInfo,
  OrgUser: OrgUser,
  Letter: Letter,
  Parcel: Parcel,
  Delivery: Delivery,
  Transport: Transport,
  Sender: Sender,
  SenderDeliverable: SenderDeliverable,
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

  const entityClasses = Object.values(EntityMap);

  Object.entries(repos).forEach(([name, repo]) => {
    const model = EntityMap[name as EntityName];
    const definition = model.definition;
    for (const relationName in definition.relations) {
      const relation = definition.relations[relationName];
      const target = relation.target();
      const targetRepo = repos[target.name as EntityName];

      const getTargetRepoDict = {[target.name]: async () => targetRepo};

      for (const cls of entityClasses) {
        getTargetRepoDict[cls.name] = async () => repos[cls.name as EntityName];
      }

      if (relation.type === 'belongsTo') {
        repo.registerInclusionResolver(
          relationName,
          createBelongsToInclusionResolver(relation as BelongsToDefinition, getTargetRepoDict),
        );
      } else if (relation.type === 'hasMany') {
        if ('through' in relation && relation.through) {
          repo.registerInclusionResolver(
            relationName,
            createHasManyThroughInclusionResolver(
              relation as HasManyDefinition,
              async () => repos[relation.through!.model().name as EntityName],
              getTargetRepoDict,
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
          createHasOneInclusionResolver(relation as HasOneDefinition, getTargetRepoDict),
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
    acc[entity.name] = givenJoinResolver(entity, ds);
    return acc;
  }, {} as Record<string, JoinResolver<any>>);
}

export function givenJoinResolver(entityClass: EntityClass, dbOrDS: juggler.DataSource | DB) {
  const ds = dbOrDS instanceof juggler.DataSource ? dbOrDS : dbOrDS.ds;
  return new JoinResolver<any>(entityClass, ds);
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

export function getRepoFromQuery(query: Query<Entity>) {
  return (query as DefaultQuery<Entity>).repo;
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
