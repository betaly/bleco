/* eslint-disable @typescript-eslint/no-explicit-any */
import {get, set} from '../../utils';

describe('utils', () => {
  describe('get', () => {
    const testData = {
      a: {
        b: {
          c: 1,
          d: [2, 3, {e: 4}],
        },
      },
    };

    test('accessing a simple property', () => {
      expect(get(testData, 'a')).toEqual({b: {c: 1, d: [2, 3, {e: 4}]}});
    });

    test('accessing a nested property', () => {
      expect(get(testData, 'a.b.c')).toBe(1);
    });

    test('handling array indices', () => {
      expect(get(testData, 'a.b.d[0]')).toBe(2);
    });

    test('complex path with arrays and objects', () => {
      expect(get(testData, 'a.b.d[2].e')).toBe(4);
    });

    test('complex path with array reduce', () => {
      expect(get(testData, 'a.b.d[].e')).toEqual([undefined, undefined, 4]);
    });

    test('returning default value for non-existent path', () => {
      expect(get(testData, 'a.x', 'default')).toBe('default');
    });

    test('invalid paths', () => {
      expect(get(testData, 'a.b.[].e')).toBeUndefined();
    });

    test('empty path', () => {
      expect(get(testData, '')).toEqual(testData);
    });

    test('non-object input', () => {
      expect(get(null, 'a.b', 'default')).toBe('default');
    });
  });

  describe('set', () => {
    it('should set a value in a simple object', () => {
      const obj = {a: {b: 1}};
      set(obj, 'a.b', 2);
      expect(obj.a.b).toBe(2);
    });

    it('should set a value in a nested object', () => {
      const obj = {a: {b: {c: 1}}};
      set(obj, 'a.b.c', 3);
      expect(obj.a.b.c).toBe(3);
    });

    it('should create nested objects if they do not exist', () => {
      const obj = {} as any;
      set(obj, 'a.b.c', 4);
      expect(obj.a.b.c).toBe(4);
    });

    it('should handle array paths correctly', () => {
      const obj = {a: [{}, {}]} as any;
      set(obj, 'a[1].b', 5);
      expect(obj.a[1].b).toBe(5);
    });

    it('should throw an error for invalid path', () => {
      const obj = {};
      expect(() => {
        set(obj, '', 6);
      }).toThrow('Path must be a non-empty string');
    });
  });
});
