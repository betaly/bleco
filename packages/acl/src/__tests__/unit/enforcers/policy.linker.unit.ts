import {compile, link} from '../../../enforcers/default';
import {GlobalPolicy, IssuePolicy, OrgPolicy, RepoPolicy} from '../../../test';

describe('Policy Linker', function () {
  it('should link', async () => {
    const compiled = compile([GlobalPolicy, OrgPolicy, RepoPolicy, IssuePolicy]);
    const resolved = link(compiled);
    expect(resolved).toMatchSnapshot();
  });
});
