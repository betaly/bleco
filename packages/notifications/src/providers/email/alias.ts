import {NodemailerBindings} from './nodemailer';
import {SESBindings} from './ses';

export const EmailAliasMetadata = {
  nodemailer: NodemailerBindings.Config,
  ses: SESBindings.Config,
};
