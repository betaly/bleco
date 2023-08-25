const nodemailer = jest.createMockFromModule<typeof import('nodemailer')>('nodemailer');

nodemailer.createTransport = jest.fn().mockImplementation(() => {
  return {
    sendMail: jest.fn().mockResolvedValue({}),
  };
});

export = nodemailer;
