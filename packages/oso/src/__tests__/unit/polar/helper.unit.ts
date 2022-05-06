import {generateScript} from '../../../polar';

describe('polar/helper', () => {
  it('generate script', async () => {
    const result = await generateScript(writer => {
      writer.write('Hello, ');
      writer.write('world!');
    });
    expect(result).toBe('Hello, world!');
  });
});
