export class AuthorizationError extends Error {
  code: string;
}

export class NotFoundError extends AuthorizationError {
  constructor() {
    super(
      'ACL NotFoundError -- The current user does not have permission to read the given resource. You should handle this error by returning a 404 error to the client.',
    );

    Error.captureStackTrace(this, this.constructor);

    this.code = 'NOT_FOUND';
  }
}

export class ForbiddenError extends AuthorizationError {
  constructor() {
    super(
      'ACL ForbiddenError -- The requested action was not allowed for the given resource. You should handle this error by returning a 403 error to the client.',
    );

    Error.captureStackTrace(this, this.constructor);

    this.code = 'FORBIDDEN';
  }
}

export class RolesExistsError extends Error {
  code: string;

  constructor(roles: string[]) {
    super(RolesExistsError.getMessage(roles));
    Error.captureStackTrace(this, this.constructor);
    this.code = 'ROLES_ALREADY_EXISTS';
  }

  private static message = 'RolesExistsError -- The following role(s) already exist: ';

  static getMessage(roles: string[]) {
    return RolesExistsError.message + roles.join(', ');
  }
}
