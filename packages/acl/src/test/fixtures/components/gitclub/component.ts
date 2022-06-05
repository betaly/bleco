import {Component} from '@loopback/core';
import {models} from './models';
import {policies} from './policies';
import {repositories} from './repositories';

export class GitClubComponent implements Component {
  models = models;
  repositories = repositories;
  policies = policies;
}
