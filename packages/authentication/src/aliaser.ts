import {Aliaser} from '@bleco/aliaser';
import {StrategiesOptionsMetadata} from './strategies';

export const ConfigAliaser = Aliaser.create({
  auth: StrategiesOptionsMetadata,
});
