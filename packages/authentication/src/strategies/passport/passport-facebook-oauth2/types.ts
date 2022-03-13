import {StrategyOption} from 'passport-facebook';

export interface ExtendedStrategyOption extends StrategyOption {
  passReqToCallback?: false;
}
