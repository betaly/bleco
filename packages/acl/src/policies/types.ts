import {Entity} from '@loopback/repository';

export namespace AclModelRelationKeys {
  export const PrincipalRoleMappings = 'roles';
  export const ResourceRoles = 'roles';
  export const ResourceRoleMappings = 'principals';

  export const RoleMappingResource = (resourceCls: typeof Entity) => `_resource${resourceCls.modelName}`;
  export const RoleMappingPrincipal = (principalCls: typeof Entity) => `_principal${principalCls.modelName}`;
}
