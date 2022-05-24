import {ValueOrPromise} from '@loopback/context';
import {GitClubApplication} from './fixtures';

export type AppInit = (app: GitClubApplication) => ValueOrPromise<void>;
