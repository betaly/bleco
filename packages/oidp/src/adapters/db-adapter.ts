import * as oidc from 'oidc-provider';
import {AdapterPayload} from 'oidc-provider';

import {OidcRepository} from '../repositories';

export class DbAdapter implements oidc.Adapter {
  constructor(protected model: string, protected repo: OidcRepository) {}

  consume(id: string): Promise<void | undefined> {
    return this.repo.consume(this.model, id);
  }

  destroy(id: string): Promise<void | undefined> {
    return this.repo.destroy(this.model, id);
  }

  find(id: string): Promise<AdapterPayload | void | undefined> {
    return this.repo.findPayload(this.model, id);
  }

  findByUid(uid: string): Promise<AdapterPayload | void | undefined> {
    return this.repo.findPayloadByUid(this.model, uid);
  }

  findByUserCode(userCode: string): Promise<AdapterPayload | void | undefined> {
    return this.repo.findPayloadByUserCode(this.model, userCode);
  }

  async revokeByGrantId(grantId: string): Promise<void | undefined> {
    await this.repo.revokeByGrantId(this.model, grantId);
  }

  upsert(id: string, payload: AdapterPayload, expiresIn?: number): Promise<void | undefined> {
    return this.repo.upsert(this.model, id, payload, expiresIn);
  }
}
