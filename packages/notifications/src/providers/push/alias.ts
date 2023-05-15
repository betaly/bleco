import {ApnsBinding} from './apns/keys';
import {FcmBindings} from './fcm/keys';
import {PubnubBindings} from './pubnub/keys';
import {SocketBindings} from './socketio/keys';

export const PushAliasMetadata = {
  apns: ApnsBinding.Config,
  fcm: FcmBindings.Config,
  pubnub: PubnubBindings.Config,
  socketio: SocketBindings.Config,
};
