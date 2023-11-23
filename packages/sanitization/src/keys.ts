import {SanitizationMetadata} from './types';
import {BindingKey, CoreBindings} from '@loopback/core';
import {SanitizationComponent} from './sanitization-component';

export namespace SanitizationBindings {
  export const METADATA = BindingKey.create<SanitizationMetadata>('sanitization.operationMetadata');
  export const COMPONENT = BindingKey.create<SanitizationComponent>(`${CoreBindings.COMPONENTS}.SanitizationComponent`);
}
