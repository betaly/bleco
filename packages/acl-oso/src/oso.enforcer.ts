import debugFactory from 'debug';
import {Oso} from 'oso';
import {asEnhancerStrategyExtension, AuthorizedFilter, EnforcerStrategy} from '@bleco/acl';
import {Class, ClassParams, Options} from 'oso/dist/src/types';
import {injectable} from '@loopback/core';
import {Entity, EntityCrudRepository} from '@loopback/repository';
import {EntityClass} from '@bleco/query';
import {Relation} from 'oso/dist/src/filter';

const debug = debugFactory('bleco:oso:enforcer');

export interface EnforcerClassOptions extends Omit<ClassParams, 'fields'> {}

export interface EnforcerOptions extends Options {}

interface ModelRepo<T extends Entity = Entity> {
  model: EntityClass<T>;
  repo?: string | EntityCrudRepository<T, unknown>;
  options?: EnforcerClassOptions;
}

@injectable(asEnhancerStrategyExtension)
export class OsoEnforcer<Actor extends Entity = Entity, Resource extends Entity = Entity>
  extends Oso<Actor, string, Resource, string, unknown, AuthorizedFilter<Resource>>
  implements EnforcerStrategy<Actor, Resource>
{
  name = 'oso';

  readonly models: Map<string, ModelRepo> = new Map();

  registerModel(model: EntityClass, fields: Record<string, Class | Relation>, options?: EnforcerClassOptions): void {
    debug('Register model "%s" with fields: %o', model.modelName, fields);
    this.registerClass(model, {fields, ...options});
  }
}
