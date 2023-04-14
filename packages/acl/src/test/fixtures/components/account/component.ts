import {Component, createBindingFromClass} from '@loopback/core';

import {AclBindings} from '../../../../keys';
import {models} from './models';
import {policies} from './policies';
import {PrincipalResolverProvider} from './providers';
import {repositories} from './repositories';

export class AccountComponent implements Component {
  bindings = [createBindingFromClass(PrincipalResolverProvider, {key: AclBindings.PRINCIPAL_RESOLVER})];

  models = models;
  policies = policies;
  repositories = repositories;
}
