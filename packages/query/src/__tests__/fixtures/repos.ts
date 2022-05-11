import {DefaultCrudRepository} from '@loopback/repository';
import {Org} from './models/org';
import {Proj} from './models/proj';
import {Issue} from './models/issue';
import {User} from './models/user';
import {OrgUser} from './models/org-user';
import {UserInfo} from './models/user-info';
import {Letter, Parcel} from './models/deliverable';
import {Delivery} from './models/delivery';
import {Transport} from './models/transport';
import {Sender} from './models/sender';
import {SenderDeliverable} from './models/sender-deliverable';

export type UserRepo = DefaultCrudRepository<User, typeof User.prototype.id>;
export type UserInfoRepo = DefaultCrudRepository<UserInfo, typeof UserInfo.prototype.id>;
export type OrgRepo = DefaultCrudRepository<Org, typeof Org.prototype.id>;
export type OrgUserRepo = DefaultCrudRepository<OrgUser, typeof OrgUser.prototype.id>;
export type ProjRepo = DefaultCrudRepository<Proj, typeof Proj.prototype.id>;
export type IssueRepo = DefaultCrudRepository<Issue, typeof Issue.prototype.id>;

export type LetterRepo = DefaultCrudRepository<Letter, typeof Letter.prototype.id>;
export type ParcelRepo = DefaultCrudRepository<Parcel, typeof Parcel.prototype.id>;
export type DeliveryRepo = DefaultCrudRepository<Delivery, typeof Delivery.prototype.id>;
export type TransportRepo = DefaultCrudRepository<Transport, typeof Transport.prototype.id>;
export type SenderRepo = DefaultCrudRepository<Sender, typeof Sender.prototype.id>;
export type SenderDeliverableRepo = DefaultCrudRepository<SenderDeliverable, typeof SenderDeliverable.prototype.id>;
