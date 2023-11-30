import {app} from 'firebase-admin';

const admin = jest.createMockFromModule<typeof import('firebase-admin')>('firebase-admin');

admin.initializeApp = () =>
  ({
    messaging: () => {
      return {
        send: () => Promise.resolve(),
        sendEachForMulticast: () => Promise.resolve(),
      };
    },
  } as unknown as app.App);

export = admin;
