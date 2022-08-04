import {getMiddlewareContext, Request, RequestContext, Response, Router} from '@loopback/rest';
import {OidpBindings} from './keys';

const debug = require('debug')('bleco:oidp:router');

export interface RouterOptions {
  /**
   * The base path where to "mount" the controller.
   */
  basePath: string;
}

function normalizePath(pathname?: string) {
  // prettier-ignore
  return '/' + (pathname ?? '')
    .replace(/^\/+/, '')
    .replace(/\/+$/, '')
    .replace(/\/+/g, '/');
}

export function createRouter(options: RouterOptions): Router {
  const basePath = normalizePath(options.basePath);
  const router = Router();
  // eslint-disable-next-line @typescript-eslint/no-misused-promises
  router.all(basePath + '/*', OidpHandler.handle(basePath));
  return router;
}

class OidpHandler {
  static handle(basePath: string) {
    return new OidpHandler(basePath).handle;
  }

  constructor(protected basePath: string) {}

  callback: (request: Request, response: Response) => void;

  handle = async (request: Request, response: Response) => {
    if (!this.callback) {
      const reqCtx = getMiddlewareContext<RequestContext>(request)!;
      const provider = await reqCtx.get(OidpBindings.OIDC_PROVIDER);
      this.callback = provider.callback();
    }

    const i = request.originalUrl.indexOf(this.basePath);
    request.url = request.originalUrl.substring(i + this.basePath.length);
    debug('oidc-provider handle %s', request.originalUrl);
    return this.callback(request, response);
  };
}
