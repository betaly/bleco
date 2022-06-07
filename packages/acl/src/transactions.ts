import {juggler, Options, Transaction} from '@loopback/repository';
import IsolationLevel = juggler.IsolationLevel;

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

export class TransactionFactory {
  private readonly ds: juggler.DataSource;
  private readonly txOptions: IsolationLevel | Options;

  constructor(ds: juggler.DataSource, options?: IsolationLevel | Options) {
    this.ds = ds;
    this.txOptions = options ?? {};
  }

  async beginTransaction(options: Options): Promise<Transaction> {
    if (options.transaction) {
      return new NoopTransaction();
    }
    return (options.transaction = await beginTransaction(this.ds, this.txOptions));
  }
}

async function beginTransaction(
  dsOrRepo: juggler.DataSource | {dataSource: juggler.DataSource},
  options?: IsolationLevel | Options,
): Promise<Transaction> {
  const dsOptions: juggler.IsolationLevel | Options = options ?? {};
  const ds = 'dataSource' in dsOrRepo ? dsOrRepo.dataSource : dsOrRepo;
  return (await ds.beginTransaction(dsOptions)) as Transaction;
}
