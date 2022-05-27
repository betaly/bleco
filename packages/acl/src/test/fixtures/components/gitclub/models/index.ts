import {User} from './user.model';
import {Org} from './org.model';
import {Repo} from './repo.model';
import {Issue} from './issue.model';

export * from './user.model';
export * from './org.model';
export * from './repo.model';
export * from './issue.model';

export const models = [User, Org, Repo, Issue];