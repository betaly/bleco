import {Entity, model} from '@loopback/repository';
import {DomainObjectPolicy} from '../../../types';

@model()
export class Org extends Entity {
  static acl: DomainObjectPolicy = {};
}
