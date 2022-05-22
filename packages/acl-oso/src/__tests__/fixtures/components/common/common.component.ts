import {Component, config} from '@loopback/core';
import debugFactory from 'debug';
import {models} from './models';
import {policies} from './policies';
import {repositories} from './repositories';
import {CommonConfig} from './types';

const debug = debugFactory('bleco:oso:test:gitclub:common');

export class CommonComponent implements Component {
  models = models;
  repositories = repositories;
  policies = policies;

  constructor(
    @config()
    private commonConfig: CommonConfig = {},
  ) {
    debug('commonConfig:', commonConfig);
  }
}
