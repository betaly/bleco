import {Aliaser} from '@bleco/aliaser';
import {VaultSecurityBindings} from './keys';

export const ConfigAliaser = Aliaser.alias({
  vault: VaultSecurityBindings.CONFIG,
});
