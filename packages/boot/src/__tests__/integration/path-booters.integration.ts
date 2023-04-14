import {ControllerDefaults} from '@loopback/boot';

import {patchBooterDefaultArtifactOptionsExtensions} from '../../patch-booters';

describe('path booters', () => {
  it('patchBooterDefaultArtifactOptionsExtensions', () => {
    expect(ControllerDefaults.extensions).toEqual(['.controller.js']);
    patchBooterDefaultArtifactOptionsExtensions();
    expect(ControllerDefaults.extensions).toEqual(['.controller.[jt]s']);
  });
});
