import {Aliaser} from '@bleco/aliaser';

import {VaultSecurityBindings} from './keys';

export const ConfigAliaser = Aliaser.create({
  vault: VaultSecurityBindings.CONFIG,
});
