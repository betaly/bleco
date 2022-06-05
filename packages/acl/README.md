# @bleco/acl

> A LoopBack 4 component for ACLs support

## Dependent Injections

### Required

- `AclBindings.PRINCIPAL_SERVICE`: required in `AclAuthorizerProvider`

### Optional

- `AclBindings.ENFORCER`: default injected with `DefaultEnforcerProvider`
- `AclBindings.REPOSITORY_FACTORY`: default injected with `DefaultRepositoryFactoryProvider`
