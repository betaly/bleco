import {PutObjectCommand} from '@aws-sdk/client-s3';
import {expect} from '@loopback/testlab';
import {randomBytes} from 'crypto';
import * as dotenv from 'dotenv';

import {S3WithSigner} from '../..';
import {AwsS3Provider} from '../../providers';

dotenv.config();
const accessKey = process.env.AWS_ACCESS_KEY;
const secretKey = process.env.AWS_SECRET_KEY;
const region = process.env.AWS_REGION;
const testBucket = process.env.AWS_TEST_BUCKET ?? 'bleco-test-bucket';

const maybe = accessKey && secretKey && region ? describe : describe.skip;
maybe('AWS S3 Acceptance Tests', function () {
  let client: S3WithSigner;

  beforeAll(initClient);

  describe('Bucket operations', () => {
    it('should create bucket', createBucket);
    it('should list all buckets', async () => {
      const {Buckets} = await client.listBuckets({});
      expect(Buckets).to.have.length(1);
    });
    it('should delete a bucket', async () => {
      await client.deleteBucket({Bucket: testBucket});
    });
  });
  describe('Object operations', () => {
    beforeEach(createBucket);
    afterEach(clearBucket);
    it('should upload a single file', async () => {
      const Key = randomBytes(48).toString('hex');
      const Body = randomBytes(128).toString('hex');
      const data = await client.putObject({
        Bucket: testBucket,
        Key,
        Body,
      });
      expect(data).to.have.property('$metadata');
    });

    it('should list all objects', async () => {
      const Key = randomBytes(48).toString('hex');
      const Body = randomBytes(128).toString('hex');
      await client.putObject({
        Bucket: testBucket,
        Key,
        Body,
      });
      const {Contents} = await client.listObjects({Bucket: testBucket});
      expect(Contents).to.have.length(1);
    });

    it('should create a signed url for an object', async () => {
      const Key = randomBytes(48).toString('hex');
      const Body = randomBytes(128).toString('hex');

      const command = new PutObjectCommand({
        Bucket: testBucket,
        Key,
        Body,
      });

      // @ts-ignore
      const signedUrl = await client.getSignedUrl(command, {
        expiresIn: 1000,
      });

      expect(signedUrl).to.be.a.String();
    });
  });

  async function clearBucket() {
    const {Contents} = await client.listObjects({Bucket: testBucket});
    if (Contents && Contents.length > 0) {
      await client.deleteObjects({
        Bucket: testBucket,
        Delete: {
          Objects: Contents.map(content => ({Key: content.Key})),
        },
      });
    }
    await client.deleteBucket({
      Bucket: testBucket,
    });
  }

  async function createBucket() {
    await client.createBucket({
      Bucket: testBucket,
    });
  }
  async function initClient() {
    const provider = new AwsS3Provider({
      accessKeyId: accessKey as string,
      secretAccessKey: secretKey as string,
      region,
    });
    client = provider.value();
  }
});
