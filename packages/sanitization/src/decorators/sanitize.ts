// src/decorators/sanitize-response.decorator.ts
import {
  ClassDecoratorFactory,
  DecoratorFactory,
  MetadataAccessor,
  MetadataInspector,
  MetadataMap,
  MethodDecoratorFactory,
} from '@loopback/core';
import {SanitizationMetadata} from '../types';

export const SANITIZATION_METHOD_KEY = MetadataAccessor.create<SanitizationMetadata, MethodDecorator>(
  'sanitization:method',
);

export const SANITIZATION_CLASS_KEY = MetadataAccessor.create<SanitizationMetadata, ClassDecorator>(
  'sanitization:class',
);

class SanitizeClassDecoratorFactory extends ClassDecoratorFactory<SanitizationMetadata> {}

export class SanitizeMethodDecoratorFactory extends MethodDecoratorFactory<SanitizationMetadata> {
  protected mergeWithOwn(
    ownMetadata: MetadataMap<SanitizationMetadata>,
    target: Object,
    methodName?: string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    methodDescriptor?: TypedPropertyDescriptor<any> | number,
  ) {
    ownMetadata = ownMetadata || {};
    let methodMeta = ownMetadata[methodName!];
    if (!methodMeta) {
      methodMeta = {...this.spec};
      ownMetadata[methodName!] = methodMeta;
    }

    if (this.spec.exclude) {
      methodMeta.exclude = this.merge(methodMeta.exclude, this.spec.exclude);
    }

    if (this.spec.include) {
      methodMeta.include = this.merge(methodMeta.include, this.spec.include);
    }

    // remove any item in exclude that is also in include
    if (methodMeta.exclude && methodMeta.include) {
      methodMeta.include = methodMeta.include.filter(item => !methodMeta.exclude?.includes(item));
    }

    return ownMetadata;
  }

  private merge<T>(src?: T[], target?: T[]): T[] {
    const list: T[] = [];
    if (src === target) return src ?? list;
    const set = new Set<T>(src ?? []);
    if (target) {
      for (const i of target) {
        set.add(i);
      }
    }
    for (const i of set.values()) list.push(i);
    return list;
  }
}

export function sanitize(spec: SanitizationMetadata = {}) {
  return function sanitizeDecoratorForClassOrMethod(
    // Class or a prototype
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    target: any,
    method?: string,
    // Use `any` to for `TypedPropertyDescriptor`
    // See https://github.com/loopbackio/loopback-next/pull/2704
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    methodDescriptor?: TypedPropertyDescriptor<any>,
  ) {
    if (method && methodDescriptor) {
      // Method
      return SanitizeMethodDecoratorFactory.createDecorator(SANITIZATION_METHOD_KEY, spec, {
        decoratorName: '@sanitize',
      })(target, method, methodDescriptor!);
    }
    if (typeof target === 'function' && !method && !methodDescriptor) {
      // Class
      return SanitizeClassDecoratorFactory.createDecorator(SANITIZATION_CLASS_KEY, spec, {decoratorName: '@sanitize'})(
        target,
      );
    }
    // Not on a class or method
    throw new Error(
      '@intercept cannot be used on a property: ' + DecoratorFactory.getTargetName(target, method, methodDescriptor),
    );
  };
}

/**
 * Fetch sanitization metadata stored by `@sanitize` decorator.
 *
 * @param target Target object/class
 * @param methodName Target method
 */
export function getSanitizationMetadata(target: object, methodName: string): SanitizationMetadata | undefined {
  let targetClass: Function;
  if (typeof target === 'function') {
    targetClass = target;
    target = target.prototype;
  } else {
    targetClass = target.constructor;
  }
  const metadata = MetadataInspector.getMethodMetadata<SanitizationMetadata>(
    SANITIZATION_METHOD_KEY,
    target,
    methodName,
  );
  if (metadata) return metadata;
  // Check if the class level has `@sanitize`
  return MetadataInspector.getClassMetadata<SanitizationMetadata>(SANITIZATION_CLASS_KEY, targetClass);
}
