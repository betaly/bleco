import tk from 'timekeeper';
import {DbAdapter} from '../../adapters';
import {OidcRepository} from '../../repositories';
import {genId, testdb} from '../support';

describe('DbAdapter', function () {
  let repo: OidcRepository;

  beforeAll(givenOidcRepository);

  describe('upsert', function () {
    it('upsert with id', async () => {
      const adapter = givenAdapter('ClientCredentials');
      const id = genId();
      const data0 = {test: ['aa']};
      await adapter.upsert(id, data0);
      const result0 = await adapter.find(id);
      const data1 = {test: ['nn']};
      await adapter.upsert(id, data1);
      const result1 = await adapter.find(id);
      expect(result0).toEqual(data0);
      expect(result1).toEqual(data1);
    });

    it('Upsert with user code', async () => {
      const adapter = givenAdapter('DeviceCode');
      const id = genId();
      const keyId = genId();
      const data = {test: ['aa'], userCode: keyId};
      await adapter.upsert(id, data);
      const result = await adapter.findByUserCode(keyId);
      expect(result).toEqual(data);
    });

    it('Upsert with user uid', async () => {
      const adapter = givenAdapter('Session');
      const id = genId();
      const keyId = genId();
      const data = {test: ['aa'], uid: keyId};
      await adapter.upsert(id, data);
      const result = await adapter.findByUid(keyId);
      expect(result).toEqual(data);
    });
  });

  it('destroy', async () => {
    const adapter = givenAdapter('Interaction');
    const id0 = genId();
    const id1 = genId();
    const data = {test: ['aa']};
    await adapter.upsert(id0, data);
    await adapter.upsert(id1, data);
    await adapter.destroy(id0);
    const result0 = await adapter.find(id0);
    const result1 = await adapter.find(id1);
    expect(result0).toBeUndefined();
    expect(result1).toEqual(data);
  });

  it('revoke', async () => {
    const adapter = givenAdapter('AuthorizationCode');
    const id = genId();
    const keyId = genId();
    const data = {test: ['aa'], grantId: keyId};
    await adapter.upsert(id, data);
    await adapter.revokeByGrantId(keyId);
    const result = await adapter.find(id);
    expect(result).toBeUndefined();
  });

  it('consume', async () => {
    const adapter = givenAdapter('AccessToken');
    const id = genId();
    const data = {test: ['aa']};
    await adapter.upsert(id, data);
    await adapter.consume(id);
    const result = await adapter.find(id);
    expect(result).toEqual({...data, consumed: true});
  });

  describe('expiration', function () {
    it('should remove expired item when find for it', async () => {
      const adapter = givenAdapter('AccessToken');
      const id = genId();
      const data = {test: ['aa']};
      const expiresIn = 1;
      await adapter.upsert(id, data, expiresIn);
      let result = await adapter.find(id);
      expect(result).toEqual(data);
      tk.travel(Date.now() + expiresIn * 1000);
      result = await adapter.find(id);
      expect(result).toBeUndefined();
      const [item] = await repo.find({where: {id}});
      expect(item).toBeUndefined();
    });
  });

  function givenOidcRepository() {
    repo = new OidcRepository(testdb);
  }

  function givenAdapter(model: string) {
    return new DbAdapter(model, repo);
  }
});
