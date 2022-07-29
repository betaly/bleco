import {Request, Response} from '@loopback/rest';
import * as oidc from 'oidc-provider';
import {InteractionResults} from 'oidc-provider';
import {InteractionDetails} from '../types';

export class Interaction {
  constructor(private provider: oidc.Provider, private req: Request, private res: Response) {}

  details(): Promise<InteractionDetails> {
    return this.provider.interactionDetails(this.req, this.res);
  }

  finished(result: InteractionResults, options?: {mergeWithLastSubmission?: boolean}): Promise<void> {
    return this.provider.interactionFinished(this.req, this.res, result, options);
  }

  result(result: InteractionResults, options?: {mergeWithLastSubmission?: boolean}): Promise<string> {
    return this.provider.interactionResult(this.req, this.res, result, options);
  }
}
