import {patchBooterDefaultArtifactOptionsExtensions} from './patch-booters';

export * from '@loopback/boot';

(() => {
  patchBooterDefaultArtifactOptionsExtensions();
})();
