import { Readable } from 'stream';
import { finished } from 'stream/promises';

it('leaks process output by write', () => {
  process.stdout.write('leaking output');
});
it('leaks process output by pipe', async () => {
  const input = Readable.from('fubar');
  input.pipe(process.stdout, { end: false });
  await finished(input);
});
