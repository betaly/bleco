import {FcmBindings} from './fcm';
import {PubnubBindings} from './pubnub';
import {SocketBindings} from './socketio';
import {ApnsBinding} from './apns';

export const PushAliasMetadata = {
  apns: ApnsBinding.Config,
  fcm: FcmBindings.Config,
  pubnub: PubnubBindings.Config,
  socketio: SocketBindings.Config,
};
