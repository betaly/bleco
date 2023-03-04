import {spawnSync} from 'child_process';
import {defineConfig, Options} from 'tsup';

const baseConfig: Options = {
  entry: ['src/**/*.ts'],
  splitting: false,
  sourcemap: true,
  minify: false,
  shims: true,
  dts: false,
  async onSuccess() {
    spawnSync('tsc', ['--project', 'tsconfig.json', '--emitDeclarationOnly', '--declaration']);
  },
};

export default defineConfig([
  {
    ...baseConfig,
    outDir: 'dist',
    target: 'node16',
    platform: 'node',
    format: ['esm'],
  },
  {
    ...baseConfig,
    outDir: 'dist',
    target: 'node14',
    platform: 'node',
    format: ['cjs'],
  },
]);
