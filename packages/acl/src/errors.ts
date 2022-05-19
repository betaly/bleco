export class AclError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AclError';
  }
}

export class AuthorizationError extends AclError {}

export class NotFoundError extends AuthorizationError {
  constructor() {
    super(
      'ACL NotFoundError -- The current user does not have permission to read the given resource. You should handle this error by returning a 404 error to the client.',
    );
  }
}

export class ForbiddenError extends AuthorizationError {
  constructor() {
    super(
      'ACL ForbiddenError -- The requested action was not allowed for the given resource. You should handle this error by returning a 403 error to the client.',
    );
  }
}

export class RolesExistsError extends AclError {
  constructor(roles: string[]) {
    super(RolesExistsError.getMessage(roles));
    this.name = 'RolesExistsError';
  }

  private static message = 'RolesExistsError -- The following role(s) already exist: ';

  static getMessage(roles: string[]) {
    return RolesExistsError.message + roles.join(', ');
  }
}
