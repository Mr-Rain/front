import { describe, it, expect } from 'vitest';
import { DEFAULT_AVATAR, DEFAULT_COMPANY_LOGO, getDefaultAvatarByUserType } from '@/utils/defaultImages';

describe('defaultImages.ts', () => {
  it('exports DEFAULT_AVATAR', () => {
    expect(DEFAULT_AVATAR).toBeDefined();
    expect(typeof DEFAULT_AVATAR).toBe('string');
  });

  it('exports DEFAULT_COMPANY_LOGO', () => {
    expect(DEFAULT_COMPANY_LOGO).toBeDefined();
    expect(typeof DEFAULT_COMPANY_LOGO).toBe('string');
  });

  describe('getDefaultAvatarByUserType', () => {
    it('returns company logo for company user type', () => {
      const result = getDefaultAvatarByUserType('company');
      expect(result).toBe(DEFAULT_COMPANY_LOGO);
    });

    it('returns default avatar for student user type', () => {
      const result = getDefaultAvatarByUserType('student');
      expect(result).toBe(DEFAULT_AVATAR);
    });

    it('returns default avatar for admin user type', () => {
      const result = getDefaultAvatarByUserType('admin');
      expect(result).toBe(DEFAULT_AVATAR);
    });

    it('returns default avatar for undefined user type', () => {
      const result = getDefaultAvatarByUserType(undefined);
      expect(result).toBe(DEFAULT_AVATAR);
    });

    it('returns default avatar for any other user type', () => {
      const result = getDefaultAvatarByUserType('unknown');
      expect(result).toBe(DEFAULT_AVATAR);
    });
  });
});
