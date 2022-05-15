import {Binding, Component, createBindingFromClass} from '@loopback/core';
import {AclPolicyBooter} from './booters';
import {models} from './models';
import {repositories} from './repositories';
import {services} from './services';

export class AclComponent implements Component {
  bindings: Binding[] = [createBindingFromClass(AclPolicyBooter)];

  models = models;
  repositories = repositories;
  services = services;

  constructor() {}
}
