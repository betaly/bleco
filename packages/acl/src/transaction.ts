import {juggler, Options, Transaction} from "@loopback/repository";
import IsolationLevel = juggler.IsolationLevel;

export async function beginTransaction(
  dsOrRepo: juggler.DataSource | { dataSource: juggler.DataSource },
  options?: IsolationLevel | Options,
): Promise<Transaction> {
  const dsOptions: juggler.IsolationLevel | Options = options ?? {};
  const ds = 'dataSource' in dsOrRepo ? dsOrRepo.dataSource : dsOrRepo;
  return (await ds.beginTransaction(dsOptions)) as Transaction;
}

export function createNoopTransaction() {
  return new NoopTransaction();
}

export class NoopTransaction implements Transaction {
  id = '';

  async commit(): Promise<void> {
    // noop
  }

  async rollback(): Promise<void> {
    // noop
  }

  isActive(): boolean {
    return false;
  }
}
