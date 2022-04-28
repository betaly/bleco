import {parseRelationChain} from '../../../../../drivers/sql';
import {Org} from '../../../../fixtures/models/org';
import {User} from '../../../../fixtures/models/user';

describe('parseRelationChain', () => {
  it('should parse a relation chain', () => {
    const result = parseRelationChain(Org.definition, 'users.email');
    expect(result?.property).toBeTruthy();
    expect(result).toMatchObject({
      relationChain: ['users'],
      propertyKey: 'email',
    });
  });

  it('should parse a relation chain with nested data', () => {
    const result = parseRelationChain(Org.definition, 'users.address.city');
    expect(result?.property).toBeTruthy();
    expect(result).toMatchObject({
      relationChain: ['users'],
      propertyKey: 'address.city',
    });
  });

  it('should return undefined for property key', () => {
    expect(parseRelationChain(User.definition, 'address.city')).toBeUndefined();
  });

  it('should throw an error if key is invalid', () => {
    expect(() => parseRelationChain(Org.definition, 'users')).toThrow(/Invalid relation key/);
  });

  it('should throw an error for not existing relation', () => {
    expect(() => parseRelationChain(Org.definition, '__not_exist__.email')).toThrow(/No relation and property found/);
  });

  it('should throw an error without property in key', () => {
    expect(() => parseRelationChain(Org.definition, 'users.userInfo')).toThrow(/No property in/);
  });

  it('should throw an error if property is not in last relation target', () => {
    expect(() => parseRelationChain(Org.definition, 'users.userInfo.__not_exist__')).toThrow(
      /"__not_exist__" is not in model/,
    );
  });
});
