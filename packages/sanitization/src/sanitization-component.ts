import {Component, ContextTags, createBindingFromClass} from '@loopback/core';
import {SanitizationInterceptor} from './sanitization-interceptor';
import {injectable} from '@loopback/context';
import {SanitizationBindings} from './keys';

@injectable({tags: {[ContextTags.KEY]: SanitizationBindings.COMPONENT.key}})
export class SanitizationComponent implements Component {
  bindings = [createBindingFromClass(SanitizationInterceptor)];
}
