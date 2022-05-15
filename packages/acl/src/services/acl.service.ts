import {AnyObject, DataObject, Entity, Filter, Options, repository, Where} from '@loopback/repository';
import {AclRoleActorRepository, AclRoleRepository} from '../repositories';
import {BindingScope, inject, injectable} from '@loopback/context';
import {CoreBindings} from '@loopback/core';
import {ApplicationWithAcl} from '../mixins/acl.mixin';
import {AclRole, AclRoleActor} from '../models';
import {DefaultDomainId, ResourcedFilter, ResourcedWhere} from "../types";
import {resourcePolymorphic} from "../helpers";
import {beginTransaction, createNoopTransaction} from "../transaction";

export interface RemoveRoleResult {
  roles: number;
  roleActors: number;
}

@injectable({scope: BindingScope.SINGLETON})
export class AclService {
  constructor(
    @inject(CoreBindings.APPLICATION_INSTANCE)
    public app: ApplicationWithAcl,
    @repository(AclRoleActorRepository)
    public roleActorRepository: AclRoleActorRepository,
    @repository(AclRoleRepository)
    public roleRepository: AclRoleRepository,
  ) {
  }

  async findRoles(filter: ResourcedFilter<AclRole>): Promise<AclRole[]> {
    return this.roleRepository.find(resolveFilter(filter));
  }

  async findRole(role: string, resource: Entity, domainId: string, options?: Options): Promise<AclRole | null> {
    domainId = domainId ?? DefaultDomainId;
    const {resourceType, resourceId} = resourcePolymorphic(resource);
    return this.roleRepository.findOne({
      where: {domainId, name: role, resourceId, resourceType},
    }, options);
  }

  async findRoleById(id: string): Promise<AclRole | null> {
    return this.roleRepository.findById(id);
  }

  async addRole(role: string, resource: Entity, domainId?: string): Promise<AclRole> {
    domainId = domainId ?? DefaultDomainId;
    const {resourceType, resourceId} = resourcePolymorphic(resource);

    const tx = await beginTransaction(this.roleRepository);

    try {
      let answer = await this.roleRepository.findOne({
        where: {
          domainId,
          name: role,
          resourceId,
          resourceType,
        },
      }, {transaction: tx});
      if (answer) {
        throw new Error(`Role ${role} already exists on resource ${resourceType} with id ${resourceId}.`);
      }

      answer = await this.roleRepository.create({
        domainId,
        name: role,
        resourceId,
        resourceType,
      });
      await tx.commit();
      return answer
    } catch (e) {
      await tx?.rollback();
      throw e;
    }
  }

  async removeRole(role: string, resource: Entity, domainId?: string): Promise<RemoveRoleResult | undefined> {
    domainId = domainId ?? DefaultDomainId;
    const {resourceType, resourceId} = resourcePolymorphic(resource);

    const policy = await this.app.getPolicy(resourceType);
    const isBuiltinRole = policy.roles?.includes(role);

    const where: Where<AclRoleActor> = {
      domainId,
      resourceId,
      resourceType,
    };

    const tx = await beginTransaction(this.roleRepository);
    try {
      const answer: RemoveRoleResult = {
        roles: 0,
        roleActors: 0,
      };

      if (isBuiltinRole) {
        where.name = role;
        answer.roles = 0;
      } else {
        const roleObj = await this.roleRepository.findOne({
          fields: ['id'],
          where: {
            domainId,
            name: role,
            resourceId,
            resourceType,
          },
        }, {transaction: tx});
        if (!roleObj) {
          return;
        }
        where.roleId = roleObj.id;
        answer.roles = 1;
      }
      //  remove all role actors with this role
      ({count: answer.roleActors} = await this.roleActorRepository.deleteAll(where, {transaction: tx}));

      if (where.roleId) {
        //  remove role
        await this.removeRoleById(where.roleId as string, tx);
      }
      await tx.commit();
    } catch (e) {
      await tx.rollback();
      throw e;
    }
  }

  async removeRoleById(id: string, options?: Options): Promise<RemoveRoleResult | undefined> {
    if (!await this.roleRepository.exists(id)) {
      return;
    }
    const answer: RemoveRoleResult = {
      roles: 1,
      roleActors: 0,
    };

    options = options ?? {};
    const tx = options.transaction ? createNoopTransaction() : await beginTransaction(this.roleRepository);
    options.transaction = options.transaction ?? tx;

    try {
      ({count: answer.roleActors} = await this.roleActorRepository.deleteAll({roleId: id,}, options));
      await this.roleRepository.deleteById(id, options);
      await tx.commit();
    } catch (e) {
      await tx.rollback();
      throw e;
    }
  }

  async removeRolesForResource(resource: Entity, domainId?: string): Promise<RemoveRoleResult | undefined> {
    domainId = domainId ?? DefaultDomainId;
    const {resourceType, resourceId} = resourcePolymorphic(resource);
    const where = {
      domainId,
      resourceId,
      resourceType,
    };
    const tx = await beginTransaction(this.roleRepository);
    try {
      const {count: roleActors} = await this.roleActorRepository.deleteAll(where, {transaction: tx});
      const {count: roles} = await this.roleRepository.deleteAll(where, {transaction: tx});
      await tx.commit();
      return {roleActors, roles};
    } catch (e) {
      await tx.rollback();
      throw e;
    }
  }


  async findRoleActors(filter: ResourcedFilter<AclRoleActor>, options?: Options): Promise<AclRoleActor[]> {
    return this.roleActorRepository.find(resolveFilter(filter), options);
  }

  async addRoleActor(actor: Entity | string, role: string, resource: Entity, domainId?: string) {
    domainId = domainId ?? DefaultDomainId;
    const actorId = typeof actor === 'string' ? actor : actor.getId();
    const {resourceType, resourceId} = resourcePolymorphic(resource);

    const policy = await this.app.getPolicy(resourceType);
    const isBuiltinRole = policy.roles?.includes(role);

    const data: DataObject<AclRoleActor> = {
      domainId,
      actorId,
      resourceId,
      resourceType,
    };

    const tx = await beginTransaction(this.roleRepository);

    try {

      if (isBuiltinRole) {
        data.name = role;
      } else {
        const roleObj = await this.findRole(role, resource, domainId, {transaction: tx});
        if (!roleObj) {
          throw new Error(`Role ${role} dose not exist on resource ${resourceType} with id ${resourceId}.`);
        }
        data.roleId = roleObj.id;
      }

      let answer = await this.roleActorRepository.findOne({where: data as Where<AclRoleActor>});
      if (!answer) {
        answer = await this.roleActorRepository.create(data);
      }
      await tx.commit();
      return answer;
    } catch (e) {
      await tx.rollback();
      throw e;
    }
  }

  async removeActorRole(actor: Entity | string, role: string, resource: Entity, domainId?: string) {
    domainId = domainId ?? DefaultDomainId;
    const actorId = typeof actor === 'string' ? actor : actor.getId();
    const {resourceType, resourceId} = resourcePolymorphic(resource);

    const policy = await this.app.getPolicy(resourceType);
    const isBuiltinRole = policy.roles?.includes(role);

    const where: Where<AclRoleActor> = {
      domainId,
      actorId,
      resourceId,
      resourceType,
    };

    if (isBuiltinRole) {
      where.name = role;
    } else {
      const roleObj = await this.findRole(role, resource, domainId);
      if (!roleObj) {
        throw new Error(`Role ${role} dose not exist on resource ${resourceType} with id ${resourceId}.`);
      }
      where.roleId = roleObj.id;
    }

    return this.roleActorRepository.deleteAll(where);
  }
}

export function resolveFilter<T extends object = AnyObject>(resourcedFilter: ResourcedFilter<T>): Filter<T> {
  const {where, ...others} = resourcedFilter;
  return {where: resolveWhere(where), ...others};
}

export function resolveWhere<T extends object = AnyObject>(resourcedWhere: ResourcedWhere<T>): Where<T> {
  const {resource, ...where} = resourcedWhere;
  Object.assign(where, resourcePolymorphic(resource));
  where.domainId = where.domainId ?? DefaultDomainId;
  return where as Where<T>;
}
