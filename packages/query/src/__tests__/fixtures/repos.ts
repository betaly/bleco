import {DefaultCrudRepository} from '@loopback/repository';
import {Org} from './models/org';
import {Proj} from './models/proj';
import {Issue} from './models/issue';
import {User} from './models/user';
import {OrgUser} from './models/org-user';
import {UserInfo} from './models/user-info';

export type UserRepo = DefaultCrudRepository<User, typeof User.prototype.id>;
export type UserInfoRepo = DefaultCrudRepository<UserInfo, typeof UserInfo.prototype.id>;
export type OrgRepo = DefaultCrudRepository<Org, typeof Org.prototype.id>;
export type OrgUserRepo = DefaultCrudRepository<OrgUser, typeof OrgUser.prototype.id>;
export type ProjRepo = DefaultCrudRepository<Proj, typeof Proj.prototype.id>;
export type IssueRepo = DefaultCrudRepository<Issue, typeof Issue.prototype.id>;
