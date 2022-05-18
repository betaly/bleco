// Copyright IBM Corp. 2019. All Rights Reserved.
// Node module: @loopback/repository
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {Entity, juggler} from '@loopback/repository';
import {DefaultTransactionalSoftCrudRepository} from '../../repositories';
import {Getter} from '@loopback/context';
import {UserLike} from '../../types';
import {Customer, testSoftCrudRepository} from './repository.suite';
import {givenDsAndRepo} from '../support';
import {expect} from '@loopback/testlab';

class CustomerCrudRepo extends DefaultTransactionalSoftCrudRepository<Customer, number> {
  constructor(
    entityClass: typeof Entity & {
      prototype: Customer;
    },
    dataSource: juggler.DataSource,
    readonly getCurrentUser?: Getter<UserLike | undefined>,
  ) {
    super(entityClass, dataSource, getCurrentUser);
  }
}

describe('DefaultTransactionalSoftCrudRepository', () => {
  let repo: CustomerCrudRepo;
  beforeAll(async () => {
    ({repo} = await givenDsAndRepo(CustomerCrudRepo));
  });

  describe('transactional', function () {
    it('should have beginTransaction', function () {
      expect(repo).to.have.property('beginTransaction');
    });
  });

  testSoftCrudRepository('DefaultTransactionalSoftCrudRepository', CustomerCrudRepo, () => repo);
});
