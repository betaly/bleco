import {Aliaser} from '@bleco/aliaser';
import {OidpBindings} from './keys';

export const ConfigAliaser = Aliaser.create({
  oidp: OidpBindings.CONFIG,
});
