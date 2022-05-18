import {Entity, Options, repository} from '@loopback/repository';
import {AclRoleActor, AclRoleActorParams} from '../models';
import {
  DomainAware,
  FilterWithCustomWhere,
  OptionsWithDomain,
  ResourceAware,
  ResourceParams,
  RoleAware,
} from '../types';
import {AclBaseService} from './base-service';
import {inject, injectable} from '@loopback/context';
import {BindingScope} from '@loopback/core';
import debugFactory from 'debug';
import {AclRoleActorRepository, AclRoleRepository} from '../repositories';
import {AclBindings} from '../keys';
import {PolicyManager} from '../policy.manager';

const debug = debugFactory('bleco:acl:role-actor-service');

@injectable({scope: BindingScope.SINGLETON})
export class AclRoleActorService extends AclBaseService<AclRoleActor, AclRoleActorParams> {
  repo: AclRoleActorRepository;

  constructor(
    @repository(AclRoleActorRepository)
    repo: AclRoleActorRepository,
    @inject(AclBindings.POLICY_MANAGER)
    policyManager: PolicyManager,
    @repository(AclRoleRepository)
    public roleRepository: AclRoleRepository,
  ) {
    super(repo, policyManager);
  }

  async find(
    filter: FilterWithCustomWhere<AclRoleActor, AclRoleActorParams>,
    options?: Options,
  ): Promise<AclRoleActor[]> {
    return this.repo.find(await this.resolveFilter(filter, options), options);
  }

  async findById(id: string, options?: Options): Promise<AclRoleActor> {
    return this.repo.findById(id, options);
  }

  async add(actor: Entity | string, role: string, resource: ResourceParams, options?: OptionsWithDomain) {
    options = {...options};
    const props = (await this.repo.resolveProps(
      {
        actor,
        role,
        resource,
      },
      options,
    )) as Required<ResourceAware & RoleAware & DomainAware>;

    debug('add with props', props);

    if (!(await this.roleRepository.hasRole(props.roleId!, props))) {
      throw new Error(
        `Role ${role} dose not exist on resource ${props.resourceType} with id ${props.resourceId} in domain ${props.domainId}.`,
      );
    }

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

  async remove(condition: AclRoleActorParams, options?: OptionsWithDomain) {
    options = {...options};
    const props = await this.repo.resolveProps(condition, options);

    debug('remove with props', props);

    const tx = await this.tf.beginTransaction(options);
    try {
      await this.repo.deleteAll(props, options);
      await tx.commit();
    } catch (e) {
      await tx.rollback();
      throw e;
    }
  }
}
