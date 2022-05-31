import {Filter, InclusionFilter} from '@loopback/filter';
import {
  AnyObject,
  Entity,
  EntityCrudRepository,
  findByForeignKeys,
  flattenTargetsOfOneToManyRelation,
  Getter,
  HasManyDefinition,
  InclusionResolver,
  Options,
  StringKeyOf,
} from '@loopback/repository';
import {resolveHasManyThroughMetadata} from '@loopback/repository/dist/relations/has-many/has-many-through.helpers';

const debug = require('debug')('bleco:repository:relations:has-many-through:inclusion-resolver');

// TODO: using back loopback original createHasManyThroughInclusionResolver after @loopback/repository > 4.1.2
/**
 * Creates InclusionResolver for HasManyThrough relation.
 * Notice that this function only generates the inclusionResolver.
 * It doesn't register it for the source repository.
 *
 *
 * @param meta - metadata of the hasMany relation (including through)
 * @param getThroughRepo - through repository getter i.e. where through
 * instances are
 * @param getTargetRepo - target repository getter i.e where target instances
 * are
 */
export function createHasManyThroughInclusionResolver<
  Through extends Entity,
  ThroughID,
  ThroughRelations extends object,
  Target extends Entity,
  TargetID,
  TargetRelations extends object,
>(
  meta: HasManyDefinition,
  getThroughRepo: Getter<EntityCrudRepository<Through, ThroughID, ThroughRelations>>,
  getTargetRepo: Getter<EntityCrudRepository<Target, TargetID, TargetRelations>>,
): InclusionResolver<Entity, Target> {
  const relationMeta = resolveHasManyThroughMetadata(meta);

  return async function fetchHasManyThroughModels(
    entities: Entity[],
    inclusion: InclusionFilter,
    options?: Options,
  ): Promise<((Target & TargetRelations)[] | undefined)[]> {
    if (!entities.length) return [];

    debug('Fetching target models for entities:', entities);
    debug('Relation metadata:', relationMeta);

    const sourceKey = relationMeta.keyFrom;
    const sourceIds = entities.map(e => (e as AnyObject)[sourceKey]);
    const targetKey = relationMeta.keyTo as StringKeyOf<Target>;
    if (!relationMeta.through) {
      throw new Error(`relationMeta.through must be defined on ${relationMeta}`);
    }
    const throughKeyTo = relationMeta.through.keyTo as StringKeyOf<Through>;
    const throughKeyFrom = relationMeta.through.keyFrom as StringKeyOf<Through>;

    debug('Parameters:', {
      sourceKey,
      sourceIds,
      targetKey,
      throughKeyTo,
      throughKeyFrom,
    });

    debug(
      'sourceId types',
      sourceIds.map(i => typeof i),
    );

    const throughRepo = await getThroughRepo();
    const targetRepo = await getTargetRepo();

    // find through models
    const throughFound = await findByForeignKeys(
      throughRepo,
      throughKeyFrom,
      sourceIds,
      {}, // scope will be applied at the target level
      options,
    );

    const throughResult = flattenTargetsOfOneToManyRelation(sourceIds, throughFound, throughKeyFrom);

    const result = [];

    const scope = typeof inclusion === 'string' ? {} : (inclusion.scope as Filter<Target>);

    // convert from through entities to the target entities
    for (const entityList of throughResult) {
      if (entityList) {
        // get target ids from the through entities by foreign key
        const targetIds = entityList.map(entity => entity[throughKeyTo]);

        // the explicit types and casts are needed
        const targetEntityList = await findByForeignKeys<Target, TargetRelations, StringKeyOf<Target>>(
          targetRepo,
          targetKey,
          targetIds as unknown as [],
          scope,
          {
            ...options,
            isThroughModelInclude: true,
          },
        );
        result.push(targetEntityList);
      } else {
        // no entities found, add undefined to results
        result.push(entityList);
      }
    }

    debug('fetchHasManyThroughModels result', result);
    return result;
  };
}
