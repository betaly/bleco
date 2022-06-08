import {inject, injectable} from '@loopback/context';
import {BindingScope} from '@loopback/core';
import {Options, repository, Where} from '@loopback/repository';
import debugFactory from 'debug';
import {toResourcePolymorphic} from '../helpers';
import {AclBindings} from '../keys';
import {AclRoleMapping, AclRoleMappingAttrs} from '../models';
import {PolicyRegistry} from '../policies';
import {AclRoleMappingRepository, AclRoleRepository} from '../repositories';
import {
  DomainAware,
  GlobalDomain,
  PrincipalPolymorphicOrEntity,
  ResourceAware,
  ResourcePolymorphicOrEntity,
  RoleAware,
} from '../types';
import {RoleBaseService} from './role.base.service';

const debug = debugFactory('bleco:acl:role-mapping-service');

@injectable({scope: BindingScope.SINGLETON})
export class AclRoleMappingService extends RoleBaseService<AclRoleMapping> {
  repo: AclRoleMappingRepository;

  constructor(
    @repository(AclRoleMappingRepository)
    repo: AclRoleMappingRepository,
    @inject(AclBindings.POLICY_REGISTRY)
    policyRegistry: PolicyRegistry,
    @repository(AclRoleRepository)
    public roleRepository: AclRoleRepository,
  ) {
    super(repo, policyRegistry);
  }

  async add(
    principal: PrincipalPolymorphicOrEntity,
    roleIdOrName: string,
    resource: ResourcePolymorphicOrEntity | string,
    options?: Options,
  ) {
    return this.addInDomain(principal, roleIdOrName, resource, GlobalDomain, options);
  }

  async remove(condition: AclRoleMappingAttrs, options?: Options) {
    return this.removeInDomain(condition, GlobalDomain, options);
  }

  async addInDomain(
    principal: PrincipalPolymorphicOrEntity,
    roleIdOrName: string,
    resource: ResourcePolymorphicOrEntity | string,
    domain: string,
    options?: Options,
  ) {
    options = {...options};
    const {resourceType, resourceId} = toResourcePolymorphic(resource);
    const role = await this.roleRepository.resolveRoleByIdOrName(roleIdOrName, resource, options);
    if (!role) {
      throw new Error(
        `Role "${roleIdOrName}" dose not exist on resource "${resourceType}(id=${resourceId})" in domain "${domain}".`,
      );
    }

    const props = this.repo.resolveProps(
      {
        principal,
        role,
        resource,
      },
      {domain},
    ) as Required<ResourceAware & RoleAware & DomainAware>;

    debug('add with props', props);

    const tx = await this.tf.beginTransaction(options);

    try {
      let answer = await this.repo.findOne({where: props as Where}, options);
      if (!answer) {
        answer = await this.repo.create(props, options);
      }
      await tx.commit();
      return answer;
    } catch (e) {
      await tx.rollback();
      throw e;
    }
  }

  async removeInDomain(condition: AclRoleMappingAttrs, domain: string, options?: Options) {
    options = {...options};
    const where = this.repo.resolveProps(condition, {domain}) as Where<AclRoleMapping>;

    debug('remove with props', where);

    const tx = await this.tf.beginTransaction(options);
    try {
      await this.repo.deleteAll(where, options);
      await tx.commit();
    } catch (e) {
      await tx.rollback();
      throw e;
    }
  }
}
