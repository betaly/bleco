import querystring from 'querystring';
import isEmpty from 'tily/is/empty';
import {AnyObj} from 'tily/typings/types';
import util from 'util';

export function createInspect() {
  const keys = new Set();
  return (obj: AnyObj) =>
    querystring.stringify(
      Object.entries(obj).reduce((acc, [key, value]) => {
        keys.add(key);
        if (isEmpty(value)) return acc;
        acc[key] = util.inspect(value, {depth: null});
        return acc;
      }, {} as Record<string, string>),
      '<br/>',
      ': ',
      {
        encodeURIComponent(value) {
          return keys.has(value) ? `<strong>${value}</strong>` : value;
        },
      },
    );
}
