import {Client, createRestAppClient, givenHttpServerConfig} from '@loopback/testlab';
import {TestApplication} from './application';
import {RateLimitConfig} from '../../types';
import {RateLimitSecurityBindings} from '../../keys';
import {Class} from '@loopback/repository';
import {SequenceHandler} from '@loopback/rest';
import {TestMiddlewareSequence} from './sequences';

export async function setUpApplication(
  sequence: Class<SequenceHandler>,
  rateLimitConfig: RateLimitConfig,
): Promise<AppWithClient> {
  const app = new TestApplication({
    rest: givenHttpServerConfig(),
    RatelimitActionMiddleware: sequence.name === TestMiddlewareSequence.name,
  });

  app.sequence(sequence);
  app.bind(RateLimitSecurityBindings.CONFIG).to(rateLimitConfig);

  await app.boot();
  await app.start();

  const client = createRestAppClient(app);

  return {app, client};
}

export interface AppWithClient {
  app: TestApplication;
  client: Client;
}
