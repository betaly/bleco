import {BindingScope, inject, injectable} from '@loopback/context';
import {DefaultCrudRepository, juggler, Where} from '@loopback/repository';
import {AdapterPayload} from 'oidc-provider';
import {OidcItem} from '../models';
import {OidcDataSourceName} from '../types';

const debug = require('debug')('bleco:oidp:repository');

const TYPES: Record<string, number> = [
  'Session',
  'AccessToken',
  'AuthorizationCode',
  'RefreshToken',
  'DeviceCode',
  'ClientCredentials',
  'Client',
  'InitialAccessToken',
  'RegistrationAccessToken',
  'Interaction',
  'ReplayDetection',
  'PushedAuthorizationRequest',
  'Grant',
].reduce((map, name, i) => ({...map, [name]: i + 1}), {});

@injectable({scope: BindingScope.SINGLETON})
export class OidcRepository extends DefaultCrudRepository<OidcItem, typeof OidcItem.prototype.id> {
  constructor(@inject(`datasources.${OidcDataSourceName}`) protected datasource: juggler.DataSource) {
    super(OidcItem, datasource);
  }

  async upsert(model: string, id: string, payload: AdapterPayload, expiresIn?: number) {
    debug('upsert %s %s %O', model, id, payload);
    const data = new OidcItem({
      id,
      type: TYPES[model],
      payload,
      grantId: payload.grantId,
      userCode: payload.userCode,
      uid: payload.uid,
      expiresAt: calcExpireAt(expiresIn),
    });
    const result = await this.updateAll(data, {id, type: TYPES[model]});
    if (result.count === 0) {
      await this.create(data);
    }
  }

  async destroy(model: string, id: string) {
    debug('destroy %s %s', model, id);
    await this.deleteAll({id, type: TYPES[model]});
  }

  async consume(model: string, id: string) {
    debug('consume %s %s', model, id);
    await this.updateAll({consumedAt: Date.now()}, {id, type: TYPES[model]});
  }

  async findPayload(model: string, id: string): Promise<AdapterPayload | undefined> {
    debug('findPayload %s %s', model, id);
    return this.findBy({id, type: TYPES[model]});
  }

  async findPayloadByUid(model: string, uid: string): Promise<AdapterPayload | undefined> {
    debug('findPayloadByUid %s %s', model, uid);
    return this.findBy({uid, type: TYPES[model]});
  }

  async findPayloadByUserCode(model: string, userCode: string): Promise<AdapterPayload | undefined> {
    debug('findPayloadByUserCode %s %s', model, userCode);
    return this.findBy({userCode, type: TYPES[model]});
  }

  async revokeByGrantId(model: string, grantId: string) {
    debug('revokeByGrantId %s', grantId);
    return this.deleteAll({grantId, type: TYPES[model]});
  }

  async clearExpires() {
    const now = Date.now();
    return this.deleteAll({expiresAt: {lte: now}});
  }

  private async findBy(where: Where<OidcItem>) {
    const item = await this.findOne({where});
    if (item) {
      if (isExpired(item.expiresAt)) {
        await this.delete(item);
        return;
      }
      return {
        ...item.payload,
        ...(item.consumedAt ? {consumed: true} : undefined),
      };
    }
  }
}

function calcExpireAt(expiresIn?: number) {
  return expiresIn ? Date.now() + expiresIn * 1000 : undefined;
}

function isExpired(expiresAt?: number) {
  return expiresAt && expiresAt < Date.now();
}
