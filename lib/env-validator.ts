/**
 * Environment Variable Validator
 * Ensures all required environment variables are set before the app starts
 */

export class EnvValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'EnvValidationError';
  }
}

interface EnvConfig {
  required: string[];
  optional?: string[];
}

/**
 * Validates that required environment variables are present
 * Throws an error if any required variables are missing
 */
export function validateEnv(config: EnvConfig): void {
  const missing: string[] = [];

  for (const key of config.required) {
    const value = process.env[key];
    if (!value || value.trim() === '') {
      missing.push(key);
    }
  }

  if (missing.length > 0) {
    throw new EnvValidationError(
      `Missing required environment variables:\n${missing
        .map((key) => `  - ${key}`)
        .join('\n')}\n\nPlease set these variables in your .env.local file or environment.`
    );
  }
}

/**
 * Gets an environment variable with validation
 * Throws an error if the variable is not set
 */
export function getRequiredEnv(key: string): string {
  const value = process.env[key];
  if (!value || value.trim() === '') {
    throw new EnvValidationError(
      `Required environment variable ${key} is not set. Please add it to your .env.local file.`
    );
  }
  return value;
}

/**
 * Gets an environment variable with a safe fallback
 * Only use this for non-security-critical variables
 */
export function getOptionalEnv(key: string, defaultValue: string = ''): string {
  return process.env[key] || defaultValue;
}

// Validate critical environment variables on module load
if (typeof window === 'undefined') {
  // Only run on server-side
  try {
    validateEnv({
      required: [
        'JWT_SECRET',
        'DATABASE_URL',
        'NEXT_PUBLIC_STELLAR_NETWORK',
      ],
    });
  } catch (error) {
    if (error instanceof EnvValidationError) {
      console.error('\n🚨 SECURITY ERROR:', error.message, '\n');
      // In production, fail fast
      if (process.env.NODE_ENV === 'production') {
        process.exit(1);
      }
    }
  }
}
