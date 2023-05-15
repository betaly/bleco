import {NodemailerBindings} from './nodemailer/keys';
import {SESBindings} from './ses/keys';

export const EmailAliasMetadata = {
  nodemailer: NodemailerBindings.Config,
  ses: SESBindings.Config,
};
