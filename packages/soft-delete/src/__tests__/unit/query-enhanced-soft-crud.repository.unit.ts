import {Entity, juggler, model, property} from '@loopback/repository';
import {SoftDeleteEntity} from '../../models';
import {QueryEnhancedSoftCrudRepository} from '../../repositories';
import {Getter} from '@loopback/context';
import {UserLike} from '../../types';
import {expect} from '@loopback/testlab';
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

class CustomerCrudRepo extends QueryEnhancedSoftCrudRepository<Customer, number> {
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

  testSoftCrudRepository('QueryEnhancedSoftCrudRepository', CustomerCrudRepo, () => repo);
});
