import {repository, Where} from '@loopback/repository';
import {RoleMapping, RoleMappingAttrs} from '../models';
import {
  DomainAware,
  OptionsWithDomain,
  PrincipalPolymorphicOrEntity,
  ResourceAware,
  ResourcePolymorphicOrEntity,
  RoleAware,
} from '../types';
import {AclBaseService} from './base-service';
import {inject, injectable} from '@loopback/context';
import {BindingScope} from '@loopback/core';
import debugFactory from 'debug';
import {RoleMappingRepository, RoleRepository} from '../repositories';
import {AclBindings} from '../keys';
import {PolicyManager} from '../policy.manager';
import {toResourcePolymorphic} from '../helpers';

const debug = debugFactory('bleco:acl:role-mapping-service');

@injectable({scope: BindingScope.SINGLETON})
export class RoleMappingService extends AclBaseService<RoleMapping> {
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
    options?: OptionsWithDomain,
  ) {
    options = {...options};
    const domain = await this.repo.getCurrentDomain(options);
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

  async remove(condition: RoleMappingAttrs, options?: OptionsWithDomain) {
    options = {...options};
    const domain = await this.repo.getCurrentDomain(options);
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
