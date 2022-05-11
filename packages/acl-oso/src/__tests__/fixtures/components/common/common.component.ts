import {Component, config} from '@loopback/core';
import {models} from './models';
import {repositories} from './repositories';
import {CommonConfig} from './types';
import debugFactory from 'debug';
import {inject} from '@loopback/context';
import {OsoBindings} from '../../../../keys';
import {Enforcer} from '../../../../enforcer';
import {policy} from './common.security';

const debug = debugFactory('bleco:oso:test:gitclub:common');

export class CommonComponent implements Component {
  models = models;
  repositories = repositories;
  osoClasses = models;
  osoPolicy = policy;

  constructor(
    @inject(OsoBindings.ENFORCER)
    private enforcer: Enforcer,
    @config()
    private commonConfig: CommonConfig = {},
  ) {
    debug('commonConfig:', commonConfig);
  }
}
