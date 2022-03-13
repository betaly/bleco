import {Aliaser} from '@bleco/aliaser';
import {
  AppleAuthBindings,
  AzureAdAuthBindings,
  BearerAuthBindings,
  ClientPasswordAuthBindings,
  FacebookAuthBindings,
  GoogleAuthBindings,
  InstagramAuthBindings,
  KeycloakAuthBindings,
  LocalAuthBindings,
  OtpAuthBindings,
  ResourceOwnerPasswordAuthBindings,
} from './strategies';

export const StrategiesAliaser = Aliaser.create({
  auth: {
    apple: AppleAuthBindings.Config,
    azured: AzureAdAuthBindings.Config,
    bearer: BearerAuthBindings.Config,
    clientPassword: ClientPasswordAuthBindings.Config,
    facebook: FacebookAuthBindings.Config,
    google: GoogleAuthBindings.Config,
    instagram: InstagramAuthBindings.Config,
    keycloak: KeycloakAuthBindings.Config,
    local: LocalAuthBindings.Config,
    otp: OtpAuthBindings.Config,
    resourceOwnerPassword: ResourceOwnerPasswordAuthBindings.Config,
  },
});
