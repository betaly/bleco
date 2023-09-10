import {BindingKey} from '@loopback/core';
import {ActorId} from './types';

export namespace AuditBindings {
  export const ActorIdKey = BindingKey.create<ActorId>(`bleco.audit.actorid`);
}
