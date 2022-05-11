import debugFactory from 'debug';
import {isConstructor} from 'tily/is/constructor';
import {
  Entity,
  HasManyDefinition,
  HasOneDefinition,
  ModelDefinition,
  PropertyType,
  RelationMetadata,
  RelationType,
} from '@loopback/repository';
import {Class} from 'oso/dist/src/types';
import {Relation} from 'oso/dist/src/filter';
import {resolveBelongsToMetadata} from '@loopback/repository/dist/relations/belongs-to/belongs-to.helpers';
import {BelongsToDefinition} from '@loopback/repository/src/relations/relation.types';
import {resolveHasManyMetadata} from '@loopback/repository/dist/relations/has-many/has-many.helpers';
import {resolveHasOneMetadata} from '@loopback/repository/dist/relations/has-one/has-one.helpers';

const debug = debugFactory('bleco:oso:oso-helper');

export function buildClassFields(
  entityOrDefinition: ModelDefinition | typeof Entity,
): Record<string, Class | Relation> {
  const definition = isConstructor(entityOrDefinition) ? entityOrDefinition.definition : entityOrDefinition;
  const fields: Record<string, Class | Relation> = {};
  for (const name in definition.properties) {
    const type = resolvePropertyType(definition.properties[name].type);
    if (!type) {
      debug(`Skip unsupported property ${name} with type ${definition.properties[name].type}`);
      continue;
    }
    fields[name] = type;
  }
  for (const name in definition.relations) {
    const relation = resolveRelation(definition.relations[name]);
    if (!relation) {
      debug(`Skip unsupported relation "${name}"`);
      continue;
    }
    fields[name] = relation;
  }
  return fields;
}

export function resolvePropertyType(type: PropertyType): Class | undefined {
  if (isConstructor(type)) {
    return type as Class;
  }

  if (type === 'string') {
    return String;
  } else if (type === 'number') {
    return Number;
  } else if (type === 'boolean') {
    return Boolean;
  } else if (type === 'date') {
    return Date;
  }
}

export function resolveRelation(metadata: RelationMetadata): Relation | undefined {
  if (metadata.type === RelationType.belongsTo) {
    const rel = resolveBelongsToMetadata(metadata as BelongsToDefinition);
    return new Relation('one', rel.target().name, rel.keyFrom, rel.keyTo);
  } else if (metadata.type === RelationType.hasOne) {
    const rel = resolveHasOneMetadata(metadata as HasOneDefinition);
    return new Relation('one', rel.target().name, rel.keyFrom, rel.keyTo);
  } else if (metadata.type === RelationType.hasMany) {
    if ((metadata as HasManyDefinition).through) {
      return;
    }
    const rel = resolveHasManyMetadata(metadata as HasManyDefinition);
    return new Relation('many', rel.target().name, rel.keyFrom, rel.keyTo);
  }
}
