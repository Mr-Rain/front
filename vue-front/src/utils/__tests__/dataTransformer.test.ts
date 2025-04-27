import { describe, it, expect } from 'vitest';
import { snakeToCamel, camelToSnake, hasSnakeCase, hasCamelCase, transformKeys } from '../dataTransformer';

describe('dataTransformer', () => {
  describe('snakeToCamel', () => {
    it('should convert snake_case keys to camelCase', () => {
      const input = {
        user_id: 1,
        first_name: 'John',
        last_name: 'Doe',
        company_info: {
          company_name: 'Acme Inc',
          company_address: {
            street_name: 'Main St',
            city_name: 'New York'
          }
        },
        tags: ['tag_one', 'tag_two']
      };

      const expected = {
        userId: 1,
        firstName: 'John',
        lastName: 'Doe',
        companyInfo: {
          companyName: 'Acme Inc',
          companyAddress: {
            streetName: 'Main St',
            cityName: 'New York'
          }
        },
        tags: ['tag_one', 'tag_two'] // Array values should not be transformed
      };

      expect(snakeToCamel(input)).toEqual(expected);
    });

    it('should handle arrays', () => {
      const input = [
        { user_id: 1, first_name: 'John' },
        { user_id: 2, first_name: 'Jane' }
      ];

      const expected = [
        { userId: 1, firstName: 'John' },
        { userId: 2, firstName: 'Jane' }
      ];

      expect(snakeToCamel(input)).toEqual(expected);
    });

    it('should handle null and primitive values', () => {
      expect(snakeToCamel(null)).toBeNull();
      expect(snakeToCamel(123)).toBe(123);
      expect(snakeToCamel('string')).toBe('string');
      expect(snakeToCamel(true)).toBe(true);
    });
  });

  describe('camelToSnake', () => {
    it('should convert camelCase keys to snake_case', () => {
      const input = {
        userId: 1,
        firstName: 'John',
        lastName: 'Doe',
        companyInfo: {
          companyName: 'Acme Inc',
          companyAddress: {
            streetName: 'Main St',
            cityName: 'New York'
          }
        },
        tags: ['tagOne', 'tagTwo']
      };

      const expected = {
        user_id: 1,
        first_name: 'John',
        last_name: 'Doe',
        company_info: {
          company_name: 'Acme Inc',
          company_address: {
            street_name: 'Main St',
            city_name: 'New York'
          }
        },
        tags: ['tagOne', 'tagTwo'] // Array values should not be transformed
      };

      expect(camelToSnake(input)).toEqual(expected);
    });

    it('should handle arrays', () => {
      const input = [
        { userId: 1, firstName: 'John' },
        { userId: 2, firstName: 'Jane' }
      ];

      const expected = [
        { user_id: 1, first_name: 'John' },
        { user_id: 2, first_name: 'Jane' }
      ];

      expect(camelToSnake(input)).toEqual(expected);
    });

    it('should handle null and primitive values', () => {
      expect(camelToSnake(null)).toBeNull();
      expect(camelToSnake(123)).toBe(123);
      expect(camelToSnake('string')).toBe('string');
      expect(camelToSnake(true)).toBe(true);
    });
  });

  describe('hasSnakeCase', () => {
    it('should detect snake_case keys', () => {
      expect(hasSnakeCase({ user_id: 1 })).toBe(true);
      expect(hasSnakeCase({ userId: 1 })).toBe(false);
      expect(hasSnakeCase({ 'user-id': 1 })).toBe(false);
    });
  });

  describe('hasCamelCase', () => {
    it('should detect camelCase keys', () => {
      expect(hasCamelCase({ userId: 1 })).toBe(true);
      expect(hasCamelCase({ user_id: 1 })).toBe(false);
      expect(hasCamelCase({ 'user-id': 1 })).toBe(false);
    });
  });

  describe('transformKeys', () => {
    it('should transform to camelCase by default', () => {
      const input = { user_id: 1, first_name: 'John' };
      const expected = { userId: 1, firstName: 'John' };
      expect(transformKeys(input)).toEqual(expected);
    });

    it('should transform to snake_case when specified', () => {
      const input = { userId: 1, firstName: 'John' };
      const expected = { user_id: 1, first_name: 'John' };
      expect(transformKeys(input, 'snake')).toEqual(expected);
    });

    it('should not transform if target style matches current style', () => {
      const camelInput = { userId: 1 };
      const snakeInput = { user_id: 1 };
      
      expect(transformKeys(camelInput, 'camel')).toEqual(camelInput);
      expect(transformKeys(snakeInput, 'snake')).toEqual(snakeInput);
    });
  });
});
