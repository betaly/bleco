import {BindingAddress} from '@loopback/context';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type ValidateFn<I = any, O = any> = (value?: I) => Promise<O> | O;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Validation<I = any, O = any> =
  | {
      parse: ValidateFn<I, O>;
    }
  | {
      validate: ValidateFn<I, O>;
    }
  | ValidateFn<I, O>;

export interface AliasDefinition {
  [prop: string]:
    | BindingAddress
    | [BindingAddress, Validation]
    | readonly [BindingAddress, Validation]
    | AliasDefinition;
}

export type InferAliasDefinition<T extends AliasDefinition> = {
  [K in keyof T]: T[K] extends [infer B, infer V]
    ? B extends BindingAddress<infer U>
      ? U
      : never
    : T[K] extends readonly [infer B, infer V]
    ? B extends BindingAddress<infer U>
      ? U
      : never
    : T[K] extends BindingAddress<infer U>
    ? U
    : T[K] extends AliasDefinition
    ? InferAliasDefinition<T[K]>
    : never;
};
