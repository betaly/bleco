import {RoleService} from './role.service';
import {RoleMappingService} from './role-mapping.service';

export * from './role.service';
export * from './role-mapping.service';

export const services = [RoleService, RoleMappingService];
