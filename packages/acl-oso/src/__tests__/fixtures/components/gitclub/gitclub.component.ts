import {Component} from '@loopback/core';
import {models} from './models';
import {repositories} from './repositories';
import {policy} from './gitclub.security';

export class GitClubComponent implements Component {
  models = models;
  repositories = repositories;
  osoClasses = models;
  osoPolicy = policy;
}
