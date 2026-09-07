const REQUIRED_PRODUCTION_VARIABLES = [
  'DATABASE_URL',
  'REDIS_URL',
  'JWT_SECRET',
  'JWT_REFRESH_SECRET',
  'MIDTRANS_SERVER_KEY',
  'MIDTRANS_CLIENT_KEY',
  'SENDGRID_API_KEY',
  'SENDGRID_FROM_EMAIL',
  'FRONTEND_URL',
  'ADMIN_URL',
  'WHATSAPP_ACCESS_TOKEN',
  'WHATSAPP_PHONE_NUMBER_ID',
  'WHATSAPP_API_VERSION',
  'WHATSAPP_CAMPAIGN_TEMPLATE_NAME',
  'WHATSAPP_LANGUAGE_CODE',
] as const;

const PLACEHOLDER_PATTERN =
  /(?:change-this|replace-me|example|placeholder|x{4,}|your[_-])/i;

export function validateEnvironment(
  configuration: Record<string, unknown>,
): Record<string, unknown> {
  if (configuration.NODE_ENV !== 'production') return configuration;

  const missing = REQUIRED_PRODUCTION_VARIABLES.filter(
    (key) => !asNonEmptyString(configuration[key]),
  );
  if (missing.length > 0) {
    throw new Error(
      `Missing required production environment variables: ${missing.join(', ')}`,
    );
  }

  const placeholders = REQUIRED_PRODUCTION_VARIABLES.filter((key) =>
    PLACEHOLDER_PATTERN.test(asNonEmptyString(configuration[key]) ?? ''),
  );
  if (placeholders.length > 0) {
    throw new Error(
      `Production environment variables still contain placeholder values: ${placeholders.join(', ')}`,
    );
  }

  for (const key of ['JWT_SECRET', 'JWT_REFRESH_SECRET'] as const) {
    if ((asNonEmptyString(configuration[key])?.length ?? 0) < 32) {
      throw new Error(`${key} must contain at least 32 characters`);
    }
  }
  assertUrlProtocol(configuration.DATABASE_URL, 'DATABASE_URL', [
    'postgres:',
    'postgresql:',
  ]);
  assertUrlProtocol(configuration.REDIS_URL, 'REDIS_URL', [
    'redis:',
    'rediss:',
  ]);
  assertUrlProtocol(configuration.FRONTEND_URL, 'FRONTEND_URL', ['https:']);
  assertUrlProtocol(configuration.ADMIN_URL, 'ADMIN_URL', ['https:']);

  const apiVersion = asNonEmptyString(configuration.WHATSAPP_API_VERSION)!;
  if (!/^v\d+\.\d+$/.test(apiVersion)) {
    throw new Error('WHATSAPP_API_VERSION must use the vNN.N format');
  }
  return configuration;
}

function asNonEmptyString(value: unknown): string | null {
  return typeof value === 'string' && value.trim() ? value.trim() : null;
}

function assertUrlProtocol(
  rawValue: unknown,
  name: string,
  allowedProtocols: readonly string[],
): void {
  const value = asNonEmptyString(rawValue)!;
  let protocol: string;
  try {
    protocol = new URL(value).protocol;
  } catch {
    throw new Error(`${name} must be a valid URL`);
  }
  if (!allowedProtocols.includes(protocol)) {
    throw new Error(
      `${name} must use ${allowedProtocols.join(' or ')} in production`,
    );
  }
}
