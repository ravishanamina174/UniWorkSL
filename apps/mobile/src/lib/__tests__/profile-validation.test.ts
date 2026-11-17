import { normalizeNic, validateStudentProfile } from '../profile-validation';
import type { StudentProfileInput } from '@uniwork/api-contracts';

const validProfile: StudentProfileInput = {
  fullName: 'Student Example', age: 21, gender: 'PREFER_NOT_TO_SAY', address: 'Colombo',
  phoneNumber: '+94 77 123 4567', nic: '200412345678', university: 'University of Colombo', faculty: 'Science',
};

describe('student profile validation', () => {
  it('accepts a valid Sri Lankan student profile', () => {
    expect(validateStudentProfile(validProfile)).toEqual({});
  });

  it('rejects invalid age, phone and NIC values', () => {
    expect(validateStudentProfile({ ...validProfile, age: 15, phoneNumber: 'abc', nic: 'invalid' })).toMatchObject({
      age: expect.any(String), phoneNumber: expect.any(String), nic: expect.any(String),
    });
  });

  it('normalizes legacy NIC suffixes without changing digits', () => {
    expect(normalizeNic(' 123456789v ')).toBe('123456789V');
  });
});
