/* eslint-disable @typescript-eslint/no-floating-promises */
import {Knex} from 'knex';
import debugFactory from 'debug';
import {
  AnyObject,
  Entity,
  HasManyDefinition,
  ModelDefinition,
  PropertyDefinition,
  RelationType,
} from '@loopback/repository';
import {Filter} from '@loopback/filter';
import {assert} from 'tily/assert';
import toArray from 'tily/array/toArray';
import {ClauseResolver} from '../resolver';
import {QuerySession} from '../session';
import {
  QueryRelationMetadata,
  RelationConstraint,
  RelationJoin,
  resolveRelation,
  SupportedRelationTypes,
} from '../relation';
import includes from 'tily/array/includes';

const debug = debugFactory('bleco:query:join');

export class JoinResolver<TModel extends Entity> extends ClauseResolver<TModel> {
  resolve(qb: Knex.QueryBuilder<TModel>, filter: Filter<TModel>, session: QuerySession = new QuerySession()): void {
    debug(`Resolving where clause for model ${this.entityClass.modelName}:`, filter, session);
    const {where, order} = filter;
    if (!where && !order) {
      debug('No where or order found, skip resolving');
      return;
    }
    if ((typeof where !== 'object' || Array.isArray(where)) && !order) {
      debug('Invalid where: %j', where);
      return;
    }

    if (where) {
      for (const key of extractKeys(where)) {
        this.compile(key, session, session.relationWhere);
      }
    }

    if (order) {
      for (const key of toArray(order)) {
        this.compile(retrieveOrderKey(key), session, session.relationOrder);
      }
    }

    this.buildJoins(qb, session);
  }

  protected buildJoins(qb: Knex.QueryBuilder, session: QuerySession) {
    // TODO: support MySQL and Postgres "uuid" type for id column: https://github.com/Wikodit/loopback-connector-postgresql/blob/develop/lib/postgresql.js#L965
    const mapper = this.mapper;
    for (const relationJoin of session.relationJoins) {
      assert(relationJoin.relation.keyFrom, 'relation.keyFrom is required');
      assert(relationJoin.relation.keyTo, 'relation.keyTo is required');

      qb.innerJoin(
        {
          [mapper.escapeName(relationJoin.prefix + mapper.table(relationJoin.model))]: mapper.tableEscaped(
            relationJoin.model,
          ),
        },
        mapper.columnEscaped(relationJoin.parentModel, relationJoin.relation.keyFrom, true, relationJoin.parentPrefix),
        mapper.columnEscaped(relationJoin.model, relationJoin.relation.keyTo, true, relationJoin.prefix),
      );
    }
  }

  protected compile(key: string, session: QuerySession, constraints: Record<string, RelationConstraint>) {
    const {definition} = this.entityClass;

    let relationChain: string[];
    let property: PropertyDefinition;
    let propertyKey: string;
    try {
      const parsed = parseRelationChain(definition, key);
      if (!parsed) {
        return;
      }
      ({relationChain, property, propertyKey} = parsed);
    } catch (e) {
      debug('Relation chain parsing failed:', e.message);
      return;
    }

    const relationPath = this.entityClass.modelName;

    let parentPrefix = '';
    let parentEntity = this.entityClass;
    let join: RelationJoin | undefined;

    for (let i = 0; i < relationChain.length; i++) {
      // Build a prefix for alias to prevent conflict
      const prefix = nextPrefix(session, i);
      const candidateRelation = relationChain[i];
      const modelDefinition = parentEntity.definition; //this.mapper.getModelDefinition(parentModel);

      if (!modelDefinition) {
        debug('No definition for model %s', parentEntity);
        break;
      }

      if (!(candidateRelation in modelDefinition.relations)) {
        debug('No relation for model %s', parentEntity.modelName);
        break;
      }

      if (includes(candidateRelation, definition.settings.hiddenRelations ?? [])) {
        debug('Hidden relation for model %s skipping', parentEntity.modelName);
        break;
      }

      let relation = modelDefinition.relations[candidateRelation] as QueryRelationMetadata;

      // Only supports belongsTo, hasOne and hasMany
      if (!SupportedRelationTypes.includes(relation.type)) {
        debug('Invalid relation type for model %s for inner join', parentEntity.modelName);
        break;
      }

      relation = resolveRelation(relation);

      const target = relation.target();
      const potentialRelationPath = `${relationPath}.${candidateRelation}`;
      // Check if the relation is already joined
      join = session.relationJoins.find(j => potentialRelationPath === j.relationPath);
      if (!join) {
        // Join the relation
        if (relation.type === RelationType.hasMany && relation.through) {
          const throughEntity = relation.through.model();
          // Add through relation join
          session.addRelationJoin({
            relationPath: `${relationPath}.-.${candidateRelation}`,
            prefix,
            parentPrefix,
            parentModel: parentEntity.modelName,
            relation: {
              keyFrom: relation.keyFrom,
              keyTo: relation.through.keyFrom,
              name: `_${candidateRelation}_`,
            } as HasManyDefinition,
            model: throughEntity.modelName,
          });

          parentPrefix = prefix;
          parentEntity = throughEntity;
          relation = {
            keyFrom: relation.through.keyTo,
            keyTo: relation.keyTo,
          } as HasManyDefinition;
        }

        // add relation join
        join = session.addRelationJoin({
          relationPath: potentialRelationPath,
          prefix,
          parentPrefix,
          parentModel: parentEntity.modelName,
          relation: {
            ...(relation as QueryRelationMetadata),
            name: candidateRelation,
          },
          model: target.modelName,
        });
      }
      // Keep the prefix of the found join
      parentPrefix = join.prefix;
      // Keep the parentEntity for recursive INNER JOIN
      parentEntity = target;
    }

    if (!join) return;

    // Keep what needed to build the WHERE or ORDER statement properly
    constraints[key] = {
      prefix: join.prefix,
      model: join.model,
      property: {
        ...property,
        key: propertyKey,
      },
    };
  }
}

export function parseRelationChain(definition: ModelDefinition, key: string) {
  const parts = key.split('.');
  if (parts.length < 2) {
    throw new Error(`Invalid relation key ${key}`);
  }
  let i = 0;
  let relation = definition.relations[parts[i]];
  if (relation) {
    let next = relation.target().definition.relations[parts[++i]];
    while (next) {
      relation = next;
      next = relation.target().definition.relations[parts[++i]];
    }
  }

  // no relation found
  if (!relation) {
    if (!definition.properties[parts[0]]) {
      throw new Error(`No relation and property found in "${key}"`);
    }
    // ignore nested properties
    return;
  }
  // no property left
  if (i >= parts.length) {
    throw new Error(`No property in "${key}"`);
  }

  const relationChain = parts.slice(0, i);
  const propertyName = parts[i];
  const target = relation.target().definition;
  const property = target.properties[propertyName];
  if (!property) {
    throw new Error(
      `"${propertyName}" is not in model "${target.name}" with relation chain "${relationChain.join('.')}"`,
    );
  }

  return {
    relationChain,
    property,
    propertyKey: parts.slice(i).join('.'),
  };
}

function extractKeys(where?: AnyObject, keys = new Set<string>()): Set<string> {
  if (!where) return keys;

  for (const key in where) {
    if (key !== 'or' && key !== 'and') {
      keys.add(key);
      continue;
    }

    const clauses = where[key];
    if (Array.isArray(clauses)) {
      for (const clause of clauses) {
        extractKeys(clause, keys);
      }
    }
  }

  return keys;
}

function retrieveOrderKey(key: string) {
  const t = key.split(/[\s,]+/);
  return t.length === 1 ? key : t[0];
}

function nextPrefix(session: QuerySession, i: number) {
  return `t_${session.nextSeq()}_${i}_`;
}
