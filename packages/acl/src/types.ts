import {AnyObject} from '@loopback/repository';

export interface DomainObjectPolicy {
  permissions?: string[];
  roles?: string[];
  rolePermissions?: Record<string, string[]>;
  roleInherits?: Record<string, string[]>;
  relations?: Record<string, {model: string; property?: string} | string>;
  rules: AnyObject;
}
