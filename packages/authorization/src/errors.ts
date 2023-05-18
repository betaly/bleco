import {BErrors} from 'berrors';

export const AuthorizeErrors = {
  NotAllowedAccess: BErrors.Unauthorized.subclass('NotAllowedAccessError', 'Not allowed access', 'not_allowed_access'),
};
