import {Constructor} from '@loopback/context';
import {juggler} from '@loopback/repository';

import {SoftCrudRepository} from '../mixins';
import {Customer} from './unit/repository.suite';

export async function givenDsAndRepo<T extends SoftCrudRepository<Customer, typeof Customer.prototype.id>>(
  repoClass: Constructor<T>,
  user = {
    id: '1',
    username: 'test',
  },
): Promise<{ds: juggler.DataSource; repo: T}> {
  const ds: juggler.DataSource = new juggler.DataSource({
    name: 'db',
    connector: 'sqlite3s',
  });
  const repo = new repoClass(Customer, ds, () => Promise.resolve(user));
  await ds.automigrate();
  return {ds, repo};
}
