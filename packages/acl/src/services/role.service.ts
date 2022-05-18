import {AclBaseService} from './base-service';
import {
  DeleteResult,
  EntityLike,
  FilterWithCustomWhere,
  OptionsWithDomain,
  PropsWithDomain,
  ResourceParams,
} from '../types';
import {AclRole, AclRoleActor, AclRoleParams} from '../models';
import {Entity, Options, repository} from '@loopback/repository';
import {inject, injectable} from '@loopback/context';
import {BindingScope} from '@loopback/core';
import {generateRoleId, isResourceParamsLike, parseRoleId, resolveRoleId} from '../helpers';
import {FilterExcludingWhere} from '@loopback/filter';
import {AclBindings} from '../keys';
import {PolicyManager} from '../policy.manager';
import {AclRoleActorRepository, AclRoleRepository} from '../repositories';
import debugFactory from 'debug';

const debug = debugFactory('bleco:acl:role-service');

@injectable({scope: BindingScope.SINGLETON})
export class AclRoleService extends AclBaseService<AclRole, AclRoleParams> {
  repo: AclRoleRepository;

  constructor(
    @repository(AclRoleRepository)
    repo: AclRoleRepository,
    @inject(AclBindings.POLICY_MANAGER)
    policyManager: PolicyManager,
    @repository(AclRoleActorRepository)
    public roleActorRepository: AclRoleActorRepository,
  ) {
    super(repo, policyManager);
  }

  async find(filter?: FilterWithCustomWhere<AclRole, AclRoleParams>, options?: OptionsWithDomain): Promise<AclRole[]> {
    return this.repo.find(filter ? await this.resolveFilter(filter, options) : undefined);
  }

  async findOne(
    filter: FilterWithCustomWhere<AclRole, AclRoleParams>,
    options?: OptionsWithDomain,
  ): Promise<AclRole | null> {
    options = {...options};
    return this.repo.findOne(await this.resolveFilter(filter, options));
  }

  async findById(id: string, filter?: FilterExcludingWhere<AclRole>, options?: Options): Promise<AclRole | null> {
    return this.repo.findById(id, filter, options);
  }

  async add(name: string, resource: Entity, options?: OptionsWithDomain): Promise<AclRole> {
    options = {...options};
    const props = await this.repo.resolveProps({name, resource}, options);

    const tx = await this.tf.beginTransaction(options);
    try {
      await (async () => {
        const type = await this.repo.hasRole(name, resource);
        if (type === 'builtin') {
          throw new Error(`Builtin role "${generateRoleId(name, resource)}" cannot be added.`);
        } else if (type === 'custom') {
          throw new Error(`Role "${generateRoleId(name, resource)}" already exists.`);
        }
      })();

      const answer = await this.repo.create(props, options);
      await tx.commit();
      return answer;
    } catch (e) {
      await tx?.rollback();
      throw e;
    }
  }

  async remove(
    role: string | EntityLike,
    resourceOrOptions?: ResourceParams | OptionsWithDomain,
    options?: OptionsWithDomain,
  ): Promise<DeleteResult<{Role: number; RoleActor: number}> | undefined> {
    let resource: ResourceParams | undefined;
    if (resourceOrOptions && isResourceParamsLike(resourceOrOptions)) {
      resource = resourceOrOptions;
    } else {
      options = resourceOrOptions;
    }
    const id = role ? resolveRoleId(role, resource) : undefined;

    if (!id && !resource) {
      throw new Error('Either role(id or name) or resource must be provided.');
    }

    options = {...options};

    let roleProps: PropsWithDomain<AclRole>;
    let roleActorProps: PropsWithDomain<AclRoleActor>;
    if (id) {
      const type = await this.repo.hasRole(id);
      if (!type) {
        return {count: 0};
      }
      if (type === 'builtin') {
        throw new Error(`Builtin role "${parseRoleId(id).name}" cannot be removed.`);
      }
      roleProps = await this.repo.resolveProps({id}, options);
      roleActorProps = await this.roleActorRepository.resolveProps({roleId: id}, options);
    } else {
      roleProps = await this.repo.resolveProps({resource}, options);
      roleActorProps = await this.roleActorRepository.resolveProps({resource}, options);
    }

    let roleCount = 0;
    let roleActorCount = 0;
    const tx = await this.tf.beginTransaction(options);
    try {
      debug('Removing role actors %o', roleActorProps);
      ({count: roleActorCount} = await this.roleActorRepository.deleteAll(roleActorProps, options));
      debug('Removed %d role actors', roleActorCount);

      debug('Removing roles %o', roleProps);
      ({count: roleCount} = await this.repo.deleteAll(roleProps, options));
      debug('Removed %d roles', roleCount);
      await tx.commit();
      return {count: roleCount, details: {Role: roleCount, RoleActor: roleActorCount}};
    } catch (e) {
      await tx.rollback();
      throw e;
    }
  }

  async removeForResource(
    resource: ResourceParams,
    options?: OptionsWithDomain,
  ): Promise<DeleteResult<{Role: number; RoleActor: number}>> {
    options = {...options};
    const roleProps = await this.repo.resolveProps({resource}, options);
    const roleActorProps = await this.roleActorRepository.resolveProps({resource}, options);

    let roleCount = 0;
    let roleActorCount = 0;
    const tx = await this.tf.beginTransaction(options);
    try {
      ({count: roleActorCount} = await this.roleActorRepository.deleteAll(roleActorProps, options));
      ({count: roleCount} = await this.repo.deleteAll(roleProps, options));
      await tx.commit();
      return {count: roleCount, details: {Role: roleCount, RoleActor: roleActorCount}};
    } catch (e) {
      await tx.rollback();
      throw e;
    }
  }
}
