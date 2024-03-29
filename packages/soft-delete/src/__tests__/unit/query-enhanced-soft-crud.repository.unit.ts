import {Getter} from '@loopback/context';
import {Entity, juggler, model, property} from '@loopback/repository';
import {expect} from '@loopback/testlab';

import {SoftDeleteEntity} from '../../models';
import {QueryEnhancedSoftCrudRepository} from '../../repositories';
import {UserLike} from '../../types';
import {givenDsAndRepo} from '../support';
import {testSoftCrudRepository} from './repository.suite';

/**
 * A mock up model class
 */
@model()
class Customer extends SoftDeleteEntity {
  @property({
    id: true,
  })
  id: number;
  @property()
  email: string;
}

class CustomerCrudRepo extends QueryEnhancedSoftCrudRepository<Customer, typeof Customer.prototype.id> {
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

describe('QueryEnhancedSoftCrudRepository', () => {
  let repo: CustomerCrudRepo;
  beforeAll(async () => {
    ({repo} = await givenDsAndRepo(CustomerCrudRepo));
  });

  describe('query enhanced', function () {
    it('should enhanced by query', function () {
      expect(repo).to.have.property('query');
    });
  });

  testSoftCrudRepository('QueryEnhancedSoftCrudRepository', () => repo);
});
