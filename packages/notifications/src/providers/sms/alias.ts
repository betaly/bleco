import {SNSBindings} from './sns';
import {TwilioBindings} from './twilio';

export const SmsAliasMetadata = {
  sns: SNSBindings.Config,
  twillio: TwilioBindings.Config,
};
