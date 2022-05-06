import {TextWriter} from '@yellicode/core';
import {ValueOrPromise} from '@loopback/context';
import {BufferWriter} from 'memstreams';
import {StreamWriter} from '@obcode/templating';

export type GenerateScriptCallback = (writer: TextWriter) => ValueOrPromise<void>;

export async function generateScript(callback: GenerateScriptCallback): Promise<string> {
  const stream = new BufferWriter();
  await callback(new StreamWriter(stream));
  return stream.data.toString();
}
