// Copyright IBM Corp. 2019. All Rights Reserved.
// Node module: @loopback/repository
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {Entity, juggler} from '@loopback/repository';
import {DefaultSoftCrudRepository} from '../../repositories';
import {Getter} from '@loopback/context';
import {UserLike} from '../../types';
import {Customer, testSoftCrudRepository} from './repository.suite';
import {givenDsAndRepo} from '../support';

class CustomerCrudRepo extends DefaultSoftCrudRepository<Customer, number> {
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

describe('DefaultSoftCrudRepository', () => {
  let repo: CustomerCrudRepo;
  beforeAll(async () => {
    ({repo} = await givenDsAndRepo(CustomerCrudRepo));
  });

  testSoftCrudRepository('DefaultSoftCrudRepository', CustomerCrudRepo, () => repo);
});