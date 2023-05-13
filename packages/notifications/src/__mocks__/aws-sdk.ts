const AWS = jest.createMockFromModule<typeof import('aws-sdk')>('aws-sdk');

AWS.SNS.prototype.publish = jest.fn().mockImplementation(() => ({promise: () => Promise.resolve()}));

AWS.SES.prototype.sendEmail = jest.fn().mockImplementation(() => ({promise: () => Promise.resolve()}));

export = AWS;
