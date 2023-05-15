import {AliSMSBindings} from './alisms/keys';
import {SNSBindings} from './sns/keys';
import {TwilioBindings} from './twilio/keys';

export const SmsAliasMetadata = {
  sns: SNSBindings.Config,
  twillio: TwilioBindings.Config,
  alisms: AliSMSBindings.Config,
};
