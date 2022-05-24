import {Entity, model, property} from '@loopback/repository';

@model()
export class AclPrincipal extends Entity {
  @property({
    id: true,
  })
  id: string;
}

@model()
export class AclResource extends Entity {
  @property({
    id: true,
  })
  id: string;
}
