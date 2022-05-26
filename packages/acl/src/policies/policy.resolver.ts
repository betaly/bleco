// import {PolicyManager} from './policy.manager';
// import {Policy} from './policy';
// import {EntityClass} from '@bleco/query';
//
// interface PermissionRoles {
//   locals: string[];
//   relations: Record<string, string[]>;
// }
//
// interface ResolvedPolicy {
//   model: EntityClass;
//   roleParents: Record<string, string[]>;
//   roleChildren: Record<string, string[]>;
//   permissionRoles: Record<string, PermissionRoles>;
// }
//
// export class PolicyResolver {
//   policies: Map<string, ResolvedPolicy>;
//
//   constructor(readonly pm: PolicyManager) {
//     this.resolve();
//   }
//
//   protected resolve() {
//     this.policies = new Map<string, ResolvedPolicy>();
//     this.pm.policies.forEach(policy => this.policies.set(policy.model.name, this.resolvePolicy(policy)));
//   }
//
//   protected resolvePolicy(policy: Policy): ResolvedPolicy {
//     const resolved: ResolvedPolicy = {
//       model: policy.model,
//       roleParents: {},
//       roleChildren: {},
//       permissionRoles: {},
//     };
//     policy.roles?.forEach(role => {
//       resolved.roleParents[role] = [...this.resolveParentRoles(policy, role, new Set<string>())];
//     });
//
//     policy.roles?.forEach(role => {
//       const roleChildren: string[] = [];
//       for (const parent in resolved.roleParents) {
//         if (resolved.roleParents[parent].includes(role)) {
//           roleChildren.push(parent);
//         }
//       }
//       resolved.roleChildren[role] = roleChildren;
//     });
//
//     policy.permissions?.forEach(permission => {
//       for (const role in policy.rolePermissions) {
//         if (policy.rolePermissions[role].includes(permission)) {
//           const permissionRoles: PermissionRoles = (resolved.permissionRoles[permission] = {
//             locals: [],
//             relations: {},
//           });
//           const roles = [role, ...(resolved.roleChildren[role] ?? [])];
//           permissionRoles.locals = roles.filter(r => !r.includes('.'));
//           if (resolved.roleParents[role]) {
//             permissionRoles.relations = resolved.roleParents[role]
//               .filter(r => r.includes('.'))
//               .reduce((acc, r) => {
//                 const [relName, relRole] = r.split('.');
//                 acc[relName] = acc[relName] ?? [];
//                 acc[relName].push(relRole);
//                 return acc;
//               }, {} as Record<string, string[]>);
//           }
//         }
//       }
//     });
//     return resolved;
//   }
//
//   protected resolveParentRoles(policy: Policy, role: string, parentRoles: Set<string>) {
//     if (policy.roleInherits?.[role]) {
//       policy.roleInherits?.[role].forEach(r => parentRoles.add(r));
//       policy.roleInherits?.[role].forEach(r => this.resolveParentRoles(policy, r, parentRoles));
//     }
//     return parentRoles;
//   }
// }
