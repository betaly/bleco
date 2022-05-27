import {Options, repository, Where} from '@loopback/repository';
import {RoleMapping, RoleMappingAttrs} from '../models';
import {
  DomainAware,
  GlobalDomain,
  PrincipalPolymorphicOrEntity,
  ResourceAware,
  ResourcePolymorphicOrEntity,
  RoleAware,
} from '../types';
import {RoleBaseService} from './role.base.service';
import {inject, injectable} from '@loopback/context';
import {BindingScope} from '@loopback/core';
import debugFactory from 'debug';
import {RoleMappingRepository, RoleRepository} from '../repositories';
import {AclBindings} from '../keys';
import {PolicyManager} from '../policies';
import {toResourcePolymorphic} from '../helpers';

const debug = debugFactory('bleco:acl:role-mapping-service');

@injectable({scope: BindingScope.SINGLETON})
export class RoleMappingService extends RoleBaseService<RoleMapping> {
  repo: RoleMappingRepository;

  constructor(
    @repository(RoleMappingRepository)
    repo: RoleMappingRepository,
    @inject(AclBindings.POLICY_MANAGER)
    policyManager: PolicyManager,
    @repository(RoleRepository)
    public roleRepository: RoleRepository,
  ) {
    super(repo, policyManager);
  }

  async add(
    principal: PrincipalPolymorphicOrEntity,
    roleIdOrName: string,
    resource: ResourcePolymorphicOrEntity,
    options?: Options,
  ) {
    return this.addInDomain(principal, roleIdOrName, resource, GlobalDomain, options);
  }

  async remove(condition: RoleMappingAttrs, options?: Options) {
    return this.removeInDomain(condition, GlobalDomain, options);
  }

  async addInDomain(
    principal: PrincipalPolymorphicOrEntity,
    roleIdOrName: string,
    resource: ResourcePolymorphicOrEntity,
    domain: string,
    options?: Options,
  ) {
    options = {...options};
    const {resourceType, resourceId} = toResourcePolymorphic(resource);
    const role = await this.roleRepository.resolveRoleByIdOrName(roleIdOrName, resource, options);
    if (!role) {
      throw new Error(
        `Role "${roleIdOrName}" dose not exist on resource "${resourceType}(id=${resourceId})" in domain ${domain}.`,
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
      let answer = await this.repo.findOne({where: props}, options);
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

  async removeInDomain(condition: RoleMappingAttrs, domain: string, options?: Options) {
    options = {...options};
    const where = this.repo.resolveProps(condition, {domain}) as Where<RoleMapping>;

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
