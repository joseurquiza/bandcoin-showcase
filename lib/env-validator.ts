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
 * Only validates at runtime (not during build)
 */
export function getRequiredEnv(key: string): string {
  // During build time, return a placeholder to prevent build failures
  // The actual validation happens at runtime when the code executes
  if (process.env.NEXT_PHASE === 'phase-production-build') {
    return `__BUILD_TIME_PLACEHOLDER_${key}__`;
  }
  
  const value = process.env[key];
  if (!value || value.trim() === '') {
    throw new EnvValidationError(
      `Required environment variable ${key} is not set. Please add it to your .env.local file or Vercel environment variables.`
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
