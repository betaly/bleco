import {patchBooterDefaultArtifactOptionsExtensions} from '../../patch-booters';
import {ControllerDefaults} from '@loopback/boot';

describe('path booters', () => {
  it('patchBooterDefaultArtifactOptionsExtensions', () => {
    expect(ControllerDefaults.extensions).toEqual(['.controller.js']);
    patchBooterDefaultArtifactOptionsExtensions();
    expect(ControllerDefaults.extensions).toEqual(['.controller.[jt]s']);
  });
});
