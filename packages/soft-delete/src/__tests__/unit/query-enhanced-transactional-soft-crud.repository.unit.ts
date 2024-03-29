import {Getter} from '@loopback/context';
import {Entity, juggler} from '@loopback/repository';
import {expect} from '@loopback/testlab';

import {QueryEnhancedTransactionalSoftCrudRepository} from '../../repositories';
import {UserLike} from '../../types';
import {givenDsAndRepo} from '../support';
import {Customer, testSoftCrudRepository} from './repository.suite';

class CustomerCrudRepo extends QueryEnhancedTransactionalSoftCrudRepository<Customer, number> {
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

describe('QueryEnhancedTransactionalSoftCrudRepository', function () {
  let repo: CustomerCrudRepo;
  beforeAll(async () => {
    ({repo} = await givenDsAndRepo(CustomerCrudRepo));
  });

  describe('query enhanced', function () {
    it('should enhanced by query', function () {
      expect(repo).to.have.property('query');
    });
  });

  describe('transactional', function () {
    it('should have beginTransaction', function () {
      expect(repo).to.have.property('beginTransaction');
    });
  });

  testSoftCrudRepository('QueryEnhancedTransactionalSoftCrudRepository', () => repo);
});
