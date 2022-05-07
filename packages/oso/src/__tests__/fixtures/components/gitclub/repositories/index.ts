import {RepoRoleRepository} from './repo-role.repository';
import {OrgRepository} from './org.repository';
import {RepoRepository} from './repo.repository';
import {OrgRoleRepository} from './org-role.repository';
import {IssueRepository} from './issue.repository';

export const repositories = [OrgRepository, OrgRoleRepository, RepoRepository, RepoRoleRepository, IssueRepository];
