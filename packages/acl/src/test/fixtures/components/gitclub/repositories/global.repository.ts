import {QueryEnhancedCrudRepository} from 'loopback4-query';
import {inject} from '@loopback/context';
import {juggler} from '@loopback/repository';

import {GLOBAL, Global} from '../models';

export class GlobalRepository extends QueryEnhancedCrudRepository<Global, typeof Global.prototype.id> {
  constructor(@inject('datasources.db') dataSource: juggler.DataSource) {
    super(Global, dataSource);
  }

  async ensureGLOBAL(): Promise<Global> {
    let global = await this.findOne({where: {id: GLOBAL.id}});
    if (!global) {
      global = await this.create(GLOBAL);
    }
    return global;
  }
}
