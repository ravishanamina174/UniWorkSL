import type { StudentProfileInput } from '@uniwork/api-contracts';

export type ProfileFieldErrors = Partial<Record<keyof StudentProfileInput, string>>;

export function validateStudentProfile(input: StudentProfileInput): ProfileFieldErrors {
  const errors: ProfileFieldErrors = {};
  if (!input.fullName.trim()) errors.fullName = 'Enter your full name.';
  if (!Number.isInteger(input.age) || input.age < 16 || input.age > 100) errors.age = 'Age must be between 16 and 100.';
  if (!input.gender) errors.gender = 'Choose a gender option.';
  if (!input.address.trim()) errors.address = 'Enter your address.';
  if (!/^[+0-9 ()-]{7,24}$/.test(input.phoneNumber.trim())) errors.phoneNumber = 'Enter a valid phone number.';
  if (!/^(?:[0-9]{9}[vVxX]|[0-9]{12})$/.test(input.nic.trim())) errors.nic = 'Enter a valid Sri Lankan NIC.';
  if (!input.university.trim()) errors.university = 'Enter your university.';
  if (!input.faculty.trim()) errors.faculty = 'Enter your faculty.';
  if (!input.primaryCategory) errors.primaryCategory = 'Choose your primary category.';
  return errors;
}

export function normalizeNic(value: string): string {
  return value.trim().toUpperCase();
}
