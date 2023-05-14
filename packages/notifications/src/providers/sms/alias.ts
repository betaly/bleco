import {SNSBindings} from './sns';
import {TwilioBindings} from './twilio';
import {AliSMSBindings} from './alisms';

export const SmsAliasMetadata = {
  sns: SNSBindings.Config,
  twillio: TwilioBindings.Config,
  alisms: AliSMSBindings.Config,
};
