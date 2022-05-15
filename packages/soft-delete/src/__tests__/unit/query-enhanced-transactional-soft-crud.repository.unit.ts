import {Entity, juggler, model, property} from '@loopback/repository';
import {SoftDeleteEntity} from '../../models';
import {QueryEnhancedTransactionalSoftCrudRepository} from '../../repositories';
import {Getter} from '@loopback/context';
import {UserLike} from '../../types';

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

class CustomerCrudRepo extends QueryEnhancedTransactionalSoftCrudRepository<Customer, number> {
  constructor(
    entityClass: typeof Entity & {
      prototype: Customer;
    },
    dataSource: juggler.DataSource,
    protected readonly getCurrentUser?: Getter<UserLike | undefined>,
  ) {
    super(entityClass, dataSource, getCurrentUser);
  }
}

describe('QueryEnhancedTransactionalSoftCrudRepository', () => {
  let repo: CustomerCrudRepo;

  beforeAll(() => {
    const ds: juggler.DataSource = new juggler.DataSource({
      name: 'db',
      connector: 'memory',
    });
    repo = new CustomerCrudRepo(Customer, ds, () =>
      Promise.resolve({
        id: '1',
        username: 'test',
      }),
    );
  });

  it('should mixin with query', async () => {
    expect(repo.query).toBeDefined();
  });
});
