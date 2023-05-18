import {BErrors} from 'berrors';

export const AuthenticationErrors = {
  CodeExpired: BErrors.Unauthorized.subclass('CodeExpiredError', 'Code Expired', 'code_expired'),
  TokenExpired: BErrors.Unauthorized.subclass('TokenExpiredError', 'Token Expired', 'token_expired'),
  TokenInvalid: BErrors.Unauthorized.subclass('TokenInvalidError', 'Token Invalid', 'token_invalid'),
  ClientInvalid: BErrors.Unauthorized.subclass('ClientInvalidError', 'Client Invalid', 'client_invalid'),
  ClientVerificationFailed: BErrors.Unauthorized.subclass(
    'ClientVerificationFailedError',
    'Client Verification Failed',
    'client_verification_failed',
  ),
  ClientSecretMissing: BErrors.Unauthorized.subclass(
    'ClientSecretMissingError',
    'Client Secret Missing',
    'client_secret_missing',
  ),
  ClientUserMissing: BErrors.Unauthorized.subclass(
    'ClientUserMissingError',
    'Client User Missing',
    'client_user_missing',
  ),
  InvalidCredentials: BErrors.Unauthorized.subclass(
    'InvalidCredentialsError',
    'Invalid Credentials',
    'invalid_credentials',
  ),
  UserVerificationFailed: BErrors.Unauthorized.subclass(
    'UserVerificationFailedError',
    'User Verification Failed',
    'user_verification_failed',
  ),
  UnknownError: BErrors.Unauthorized.subclass('UnknownError', 'Unknown Error', 'unknown_error'),
  WrongPassword: BErrors.Unauthorized.subclass('WrongPasswordError', 'Incorrect Password', 'wrong_password'),
  KeyInvalid: BErrors.Unauthorized.subclass('KeyInvalidError', 'Key Invalid', 'key_invalid'),
  OtpInvalid: BErrors.Unauthorized.subclass('OtpInvalidError', 'Otp Invalid', 'otp_invalid'),
  OtpExpired: BErrors.Unauthorized.subclass('OtpExpiredError', 'Otp Token Incorrect or Expired', 'otp_expired'),
};
