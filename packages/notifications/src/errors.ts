import {BErrors} from 'berrors';

export const NotificationErrors = {
  ProviderNotFound: BErrors.UnprocessableEntity.subclass(
    'ProviderNotFoundError',
    'Provider not found',
    'provider_not_found',
  ),
};
