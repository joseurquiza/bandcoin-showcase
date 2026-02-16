/**
 * Password Validation Utility
 * Enforces strong password requirements
 */

export interface PasswordValidationResult {
  isValid: boolean;
  errors: string[];
}

export interface PasswordRequirements {
  minLength?: number;
  requireUppercase?: boolean;
  requireLowercase?: boolean;
  requireNumbers?: boolean;
  requireSpecialChars?: boolean;
  maxLength?: number;
}

const DEFAULT_REQUIREMENTS: Required<PasswordRequirements> = {
  minLength: 8,
  requireUppercase: true,
  requireLowercase: true,
  requireNumbers: true,
  requireSpecialChars: true,
  maxLength: 128,
};

/**
 * Validates password against security requirements
 */
export function validatePassword(
  password: string,
  requirements: PasswordRequirements = {}
): PasswordValidationResult {
  const req = { ...DEFAULT_REQUIREMENTS, ...requirements };
  const errors: string[] = [];

  // Check minimum length
  if (password.length < req.minLength) {
    errors.push(`Password must be at least ${req.minLength} characters long`);
  }

  // Check maximum length
  if (password.length > req.maxLength) {
    errors.push(`Password must not exceed ${req.maxLength} characters`);
  }

  // Check uppercase
  if (req.requireUppercase && !/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }

  // Check lowercase
  if (req.requireLowercase && !/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }

  // Check numbers
  if (req.requireNumbers && !/\d/.test(password)) {
    errors.push('Password must contain at least one number');
  }

  // Check special characters
  if (req.requireSpecialChars && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('Password must contain at least one special character (!@#$%^&*(),.?":{}|<>)');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Get password strength score (0-4)
 * 0 = Very Weak, 1 = Weak, 2 = Fair, 3 = Good, 4 = Strong
 */
export function getPasswordStrength(password: string): number {
  let score = 0;

  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score++;

  return Math.min(score, 4);
}

/**
 * Check if password is commonly used (basic check)
 */
const COMMON_PASSWORDS = [
  'password',
  '12345678',
  'qwerty',
  'abc123',
  'password123',
  '123456789',
  'letmein',
  'welcome',
  'monkey',
  'dragon',
];

export function isCommonPassword(password: string): boolean {
  return COMMON_PASSWORDS.includes(password.toLowerCase());
}

/**
 * Comprehensive password validation with common password check
 */
export function validatePasswordStrict(password: string): PasswordValidationResult {
  const result = validatePassword(password);

  // Check for common passwords
  if (isCommonPassword(password)) {
    result.isValid = false;
    result.errors.push('This password is too common. Please choose a more unique password.');
  }

  return result;
}
