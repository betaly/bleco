import tk from 'timekeeper';

import {OidcRepository} from '../../repositories';
import {genId, testdb} from '../support';

describe('OidcRepository', function () {
  let repo: OidcRepository;

  beforeAll(givenOidcRepository);

  it('clearExpires', async () => {
    const model = 'AccessToken';
    const id0 = genId();
    const id1 = genId();
    const data = {test: ['aa']};
    await repo.upsert(model, id0, data, 1);
    await repo.upsert(model, id1, data, 5);

    let result = await repo.clearExpires();
    expect(result.count).toBe(0);
    result = await repo.count();
    expect(result.count).toBe(2);

    tk.travel(Date.now() + 2 * 1000);
    result = await repo.clearExpires();
    expect(result.count).toBe(1);
    result = await repo.count();
    expect(result.count).toBe(1);

    tk.travel(Date.now() + 5 * 1000);
    result = await repo.clearExpires();
    expect(result.count).toBe(1);
    result = await repo.count();
    expect(result.count).toBe(0);
  });

  function givenOidcRepository() {
    repo = new OidcRepository(testdb);
  }
});
