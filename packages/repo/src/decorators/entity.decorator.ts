import {Entity, model, ModelDefinition, ModelDefinitionSyntax} from '@loopback/repository';

/**
 * A extended decorator for model definitions for supporting inheritance relation property.
 *
 * @param definition
 * @returns A class decorator for `model`
 */
export function entity(definition?: Partial<ModelDefinitionSyntax>) {
  return function (target: Function & {definition?: ModelDefinition}) {
    model(definition)(target);
    const relations = target.definition?.relations;
    if (!relations) {
      return;
    }
    for (const key of Object.keys(relations)) {
      relations[key] = {
        ...relations[key],
        source: target as typeof Entity,
      };
    }
  };
}
