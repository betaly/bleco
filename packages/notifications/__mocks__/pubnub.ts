const Pubnub = jest.createMockFromModule<typeof import('pubnub')>('pubnub');

Pubnub.prototype.publish = jest.fn().mockImplementation(() => Promise.resolve());
Pubnub.prototype.grant = jest.fn().mockImplementation(() => Promise.resolve());

export = Pubnub;
