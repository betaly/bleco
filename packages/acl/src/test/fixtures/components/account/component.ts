import {Component, createBindingFromClass} from '@loopback/core';
import {AclBindings} from '../../../../keys';
import {models} from './models';
import {policies} from './policies';
import {repositories} from './repositories';
import {UserPrincipalService} from './services';

export class AccountComponent implements Component {
  bindings = [createBindingFromClass(UserPrincipalService, {key: AclBindings.PRINCIPAL_SERVICE})];

  models = models;
  policies = policies;
  repositories = repositories;
}
