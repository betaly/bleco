import {BErrors} from 'berrors';

export const AuthorizeErrors = {
  NotAllowedAccess: BErrors.Forbidden.subclass('NotAllowedAccessError', 'Not allowed access', 'not_allowed_access'),
};
