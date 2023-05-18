import {BErrors} from 'berrors';

export const SoftDeleteErrors = {
  EntityNotFound: BErrors.NotFound.subclass('EntityNotFoundError', 'Entity not found', 'entity_not_found'),
};
