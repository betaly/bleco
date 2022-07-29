import {Entity, model, property} from '@loopback/repository';
import {AdapterPayload} from 'oidc-provider';

@model()
export class OidcItem extends Entity {
  @property({
    type: 'string',
    id: true,
    generated: false,
  })
  id: string;

  @property({
    type: 'number',
    index: true,
  })
  type: number;

  @property({
    type: 'object',
  })
  payload: AdapterPayload;

  @property({
    type: 'string',
    index: true,
  })
  grantId: string;

  @property({
    type: 'string',
    index: true,
  })
  userCode: string;

  @property({
    type: 'string',
    index: true,
  })
  uid: string;

  @property({
    type: 'number',
    index: true,
  })
  expiresAt?: number;

  @property({
    type: 'number',
  })
  consumedAt?: number;

  constructor(data?: Partial<OidcItem>) {
    super(data);
  }
}
