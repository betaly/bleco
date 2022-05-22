import {Component} from '@loopback/core';
import {models} from './models';
import {repositories} from './repositories';
import {policies} from './policies';

export class GitClubComponent implements Component {
  models = models;
  repositories = repositories;
  policies = policies;
}
