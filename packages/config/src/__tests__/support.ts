import path from 'path';

export function fixturePath(...pathSegments: string[]) {
  return path.resolve(__dirname, '..', '..', 'fixtures', ...pathSegments);
}
