import {Global} from './global.model';
import {Issue} from './issue.model';
import {Org} from './org.model';
import {Repo} from './repo.model';

export * from './global.model';
export * from './issue.model';
export * from './org.model';
export * from './repo.model';

export const models = [Global, Org, Repo, Issue];
