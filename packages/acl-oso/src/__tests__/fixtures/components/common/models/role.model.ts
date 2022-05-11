import { Entity, model, property } from "@loopback/repository";

@model()
export class Role extends Entity {
  @property({
    type: "number",
    id: true
  })
  id: number;

  @property()
  name: string;

  @property()
  resourceType: string;

  @property()
  resourceId: number;

}
