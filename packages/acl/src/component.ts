import {Binding, Component, createBindingFromClass} from '@loopback/core';
import {PolicyBooter} from './booters';
import {models} from './models';
import {repositories} from './repositories';
import {EnforcerService, RoleMappingService, RoleService} from './services';
import {AclBindings} from './keys';
// import {DefaultEnhancerStrategy} from './strategies';

export class AclComponent implements Component {
  bindings: Binding[] = [
    createBindingFromClass(PolicyBooter),
    createBindingFromClass(RoleService, {key: AclBindings.ROLE_SERVICE}),
    createBindingFromClass(RoleMappingService, {key: AclBindings.ROLE_MAPPING_SERVICE}),
    createBindingFromClass(EnforcerService, {key: AclBindings.ENFORCER_SERVICE}),
    // createBindingFromClass(DefaultEnhancerStrategy, {key: AclBindings.ENFORCER_STRATEGY}),
  ];

  models = models;
  repositories = repositories;

  constructor() {}
}
