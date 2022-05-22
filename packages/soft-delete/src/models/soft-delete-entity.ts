import { Entity } from "@loopback/repository";
import { SoftDeleteEntityMixin } from "../mixins";

/**
 * Abstract base class for all soft-delete enabled models
 *
 * @description
 * Base class for all soft-delete enabled models created.
 * It adds three attributes to the model class for handling soft-delete,
 * namely, 'deleted', deletedOn, deletedBy
 * Its an abstract class so no repository class should be based on this.
 */
export abstract class SoftDeleteEntity extends SoftDeleteEntityMixin(Entity) {
  constructor(data?: Partial<SoftDeleteEntity>) {
    super(data);
  }
}
