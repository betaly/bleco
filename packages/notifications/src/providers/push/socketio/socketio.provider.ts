import {Provider, inject} from '@loopback/core';
import {BErrors} from 'berrors';
import io, {Socket} from 'socket.io-client';

import {SocketBindings} from './keys';
import {SocketConfig, SocketMessage, SocketNotification} from './types';

export class SocketIOProvider implements Provider<SocketNotification> {
  constructor(
    @inject(SocketBindings.Config, {
      optional: true,
    })
    private readonly socketConfig?: SocketConfig,
  ) {
    if (this.socketConfig?.url) {
      this.socketService = io(this.socketConfig.url, socketConfig?.options);
    } else {
      throw new BErrors.PreconditionFailed('Socket Config missing !');
    }
  }

  socketService: Socket;

  value() {
    return {
      publish: async (message: SocketMessage) => {
        if (message?.receiver?.to?.length > 0) {
          /**
           * This method is responsible to send all the required data to socket server
           * The socket server needs to parse the data and send the message to intended
           * user.
           *
           * emitting a message to channel passed via config
           */

          // eslint-disable-next-line @typescript-eslint/prefer-optional-chain
          if (!this.socketConfig || !this.socketConfig.defaultPath) {
            throw new BErrors.PreconditionFailed('Channel info is missing !');
          }
          this.socketService.emit(message.options?.path || this.socketConfig.defaultPath, JSON.stringify(message));
        } else {
          throw new BErrors.BadRequest('Message receiver not found');
        }
      },
    };
  }
}
