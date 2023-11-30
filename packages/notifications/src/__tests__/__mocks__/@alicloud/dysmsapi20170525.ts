const dysmsap = jest.createMockFromModule<typeof import('@alicloud/dysmsapi20170525')>('@alicloud/dysmsapi20170525');

dysmsap.default.prototype.sendSms = jest.fn().mockResolvedValue({});

export = dysmsap;
