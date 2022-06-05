import {Issue} from './issue.model';
import {Org} from './org.model';
import {Repo} from './repo.model';
import {Site} from './site.model';

export * from './issue.model';
export * from './org.model';
export * from './repo.model';
export * from './site.model';

export const models = [Site, Org, Repo, Issue];
