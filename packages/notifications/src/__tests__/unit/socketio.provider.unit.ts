/* eslint-disable @typescript-eslint/no-explicit-any */
import {expect} from '@loopback/testlab';
import Socket from 'socket.io-client';

import {SocketIOProvider} from '../../providers';
import {SocketMessage} from '../../providers/push/socketio/types';

jest.mock('socket.io-client');

const SocketMock = Socket as unknown as jest.Mock<typeof Socket>;

describe('SocketIO Service', () => {
  const configration = {
    url: 'dummyurl',
    defaultPath: 'default',
    options: {
      path: 'custompath',
    },
  };
  beforeAll(() => {
    SocketMock.mockImplementation(
      () =>
        ({
          emit: jest.fn().mockReturnValue({}),
        } as any),
    );
  });
  afterAll(() => {
    SocketMock.mockReset();
  });
  describe('socketio configration addition', () => {
    it('returns error message when no socketio config', async () => {
      try {
        const socketioProvider = new SocketIOProvider();
      } catch (err) {
        const result = err.message;
        expect(result).which.eql('Socket Config missing !');
      }
    });
    it('returs error message when receiver not found', async () => {
      const socketioProvider = new SocketIOProvider(configration).value();
      const message: SocketMessage = {
        body: 'dummy',
        sentDate: new Date(),
        type: 0,
        receiver: {
          to: [],
        },
      };

      const result = await socketioProvider.publish(message).catch(err => err.message);
      expect(result).which.eql('Message receiver not found');
    });
    it('returns a promise to be fulfilled', async () => {
      const message: SocketMessage = {
        body: 'dummy',
        sentDate: new Date(),
        type: 0,
        receiver: {
          to: [
            {
              id: 'dummy',
              type: 0,
            },
          ],
        },
      };
      const socketioProvider = new SocketIOProvider(configration).value();
      const result = socketioProvider.publish(message);
      await expect(result).to.be.fulfilled();
    });
  });
  // function setupMockSocketIo() {
  //   const mockSocket = sinon.stub().returns({
  //     emit: sinon.stub().returns({}),
  //   });
  //   SocketIOProvider = proxyquire(
  //     '../../providers/push/socketio/socketio.provider',
  //     {
  //       'socket.io-client': mockSocket,
  //     },
  //   ).SocketIOProvider;
  // }
});
