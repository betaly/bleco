import {DefaultRepositoryFactoryProvider} from '@bleco/repository-factory';
import {Binding, Component, createBindingFromClass} from '@loopback/core';
import {Acl} from './acl';
import {AclAuthorizerProvider} from './authorization';
import {PolicyBooter} from './booters';
import {DefaultEnforcerProvider} from './enforcers/default';
import {AclBindings} from './keys';
import {models} from './models';
import {repositories} from './repositories';
import {AclRoleMappingService, AclRoleService} from './services';

export class AclComponent implements Component {
  bindings: Binding[] = [
    createBindingFromClass(PolicyBooter),
    createBindingFromClass(AclRoleService, {key: AclBindings.ROLE_SERVICE}),
    createBindingFromClass(AclRoleMappingService, {key: AclBindings.ROLE_MAPPING_SERVICE}),
    createBindingFromClass(Acl, {key: AclBindings.ACL}),
  ];

  providers = {
    [AclBindings.AUTHORIZER.key]: AclAuthorizerProvider,
    [AclBindings.REPOSITORY_FACTORY.key]: DefaultRepositoryFactoryProvider,
    [AclBindings.ENFORCER.key]: DefaultEnforcerProvider,
  };

  models = models;
  repositories = repositories;

  constructor() {}
}
