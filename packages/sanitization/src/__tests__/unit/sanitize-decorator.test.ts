import {getSanitizationMetadata, sanitize} from '../../decorators/sanitize';
import {SanitizationMetadata} from '../../types';

describe('Sanitize Decorator', () => {
  it('can add sanitize metadata to target method', () => {
    class TestClass {
      @sanitize({exclude: ['password']})
      getUser() {}

      @sanitize({include: ['username', 'email']})
      listUsers() {}
    }

    let metaData: SanitizationMetadata | undefined = getSanitizationMetadata(TestClass.prototype, 'getUser');
    expect(metaData).toEqual({
      exclude: ['password'],
    });

    metaData = getSanitizationMetadata(TestClass.prototype, 'listUsers');
    expect(metaData).toEqual({
      include: ['username', 'email'],
    });
  });

  it('honors method level decoration over class level', () => {
    @sanitize({exclude: ['password']})
    class TestClass {
      @sanitize({include: ['username']})
      getUser() {}

      listUsers() {}
    }

    let metaData: SanitizationMetadata | undefined = getSanitizationMetadata(TestClass.prototype, 'getUser');
    expect(metaData).toEqual({
      include: ['username'],
    });

    metaData = getSanitizationMetadata(TestClass.prototype, 'listUsers');
    expect(metaData).toEqual({
      exclude: ['password'],
    });
  });

  it('should merge multiple sanitize definitions for a method', () => {
    class TestClass {
      @sanitize({include: ['username', 'email']})
      @sanitize({exclude: ['password', 'secret']})
      getUser() {}
    }

    const metaData: SanitizationMetadata | undefined = getSanitizationMetadata(TestClass.prototype, 'getUser');
    expect(metaData).toEqual({
      include: ['username', 'email'],
      exclude: ['password', 'secret'],
    });
  });

  it('should not merge class level and method level sanitize definitions', () => {
    @sanitize({include: ['username', 'email']})
    class TestClass {
      @sanitize({exclude: ['password']})
      getUser() {}
    }

    const metaData: SanitizationMetadata | undefined = getSanitizationMetadata(TestClass.prototype, 'getUser');
    expect(metaData).toEqual({
      exclude: ['password'],
    });
  });

  it('should properly merge overlapping include and exclude options', () => {
    class TestClass {
      @sanitize({include: ['username', 'email', 'password']})
      @sanitize({exclude: ['password']})
      getUser() {}
    }

    const metaData: SanitizationMetadata | undefined = getSanitizationMetadata(TestClass.prototype, 'getUser');
    expect(metaData).toEqual({
      include: ['username', 'email'],
      exclude: ['password'],
    });
  });
});
