import path from 'path';

import {OidpApplication} from './application';
import {loadConfig} from './config';

export * from './application';

export async function main() {
  const config = {
    rest: {
      port: +(process.env.PORT ?? 3000),
      host: process.env.HOST ?? '127.0.0.1',
      openApiSpec: {
        // useful when used with OpenAPI-to-GraphQL to locate your application
        setServersFromRequest: true,
      },
      expressSettings: {
        views: path.join(__dirname, '../views'),
        'view engine': 'ejs',
      },
    },
    ...(await loadConfig()),
  };
  const app = new OidpApplication(config);
  await app.main();
  const url = app.restServer.url;
  console.log(`The service is running at ${url}.`);
}

if (require.main === module) {
  main().catch(err => {
    console.error('Cannot start the application.', err);
    process.exit(1);
  });
}
