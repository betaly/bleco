import {generateResourceScripts, generateScript} from '../../../polar';
import * as org from './fixtures/org.resource';

describe('generate', function () {
  it('should generatePolarResourceScript', async () => {
    const result = await generateScript(writer => {
      generateResourceScripts(writer, org.resource);
    });
    expect(result).toEqual(org.script);
  });
});
