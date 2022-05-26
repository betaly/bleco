import {juggler} from '@loopback/repository';
import {Constructor} from '@loopback/context';
import {SoftCrudRepository} from '../mixins';
import {Customer} from './unit/repository.suite';

export async function givenDsAndRepo<T extends SoftCrudRepository<Customer, typeof Customer.prototype.id>>(
  repoClass: Constructor<T>,
  user = {
    id: '1',
    username: 'test',
  },
) {
  const ds: juggler.DataSource = new juggler.DataSource({
    name: 'db',
    connector: 'sqlite3e',
  });
  const repo = new repoClass(Customer, ds, () => Promise.resolve(user));
  await ds.automigrate();
  return {ds, repo};
}