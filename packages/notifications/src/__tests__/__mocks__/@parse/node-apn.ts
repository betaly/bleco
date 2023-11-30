/* eslint-disable @typescript-eslint/no-explicit-any */

const apn = jest.createMockFromModule<typeof import('@parse/node-apn')>('@parse/node-apn');

apn.Provider = jest.fn().mockImplementation(() => {
  return {
    send: jest.fn().mockReturnValue(Promise.resolve({})),
  };
}) as any;

apn.Notification = jest.fn().mockImplementation(() => {
  return {
    expiry: 0,
    badge: 0,
    alert: 'dummy alert',
    payload: {},
    topic: 'dummy topic',
  };
});

export = apn;
