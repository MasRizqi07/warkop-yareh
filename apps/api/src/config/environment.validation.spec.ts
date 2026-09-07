import { validateEnvironment } from './environment.validation';

const validProductionEnvironment = {
  NODE_ENV: 'production',
  DATABASE_URL: 'postgresql://runtime:secret@database.internal:5432/warkop',
  REDIS_URL: 'rediss://redis.internal:6379',
  JWT_SECRET: 'a'.repeat(64),
  JWT_REFRESH_SECRET: 'b'.repeat(64),
  MIDTRANS_SERVER_KEY: 'Mid-server-live-value',
  MIDTRANS_CLIENT_KEY: 'Mid-client-live-value',
  SENDGRID_API_KEY: 'SG.live-value',
  SENDGRID_FROM_EMAIL: 'hello@warkopyareh.com',
  FRONTEND_URL: 'https://warkopyareh.com',
  ADMIN_URL: 'https://admin.warkopyareh.com',
  WHATSAPP_ACCESS_TOKEN: 'whatsapp-live-access-token',
  WHATSAPP_PHONE_NUMBER_ID: '1234567890',
  WHATSAPP_API_VERSION: 'v23.0',
  WHATSAPP_CAMPAIGN_TEMPLATE_NAME: 'yareh_campaign_v1',
  WHATSAPP_LANGUAGE_CODE: 'id',
};

describe('validateEnvironment', () => {
  it('allows development to use explicit runtime fallbacks', () => {
    expect(validateEnvironment({ NODE_ENV: 'development' })).toEqual({
      NODE_ENV: 'development',
    });
  });

  it('rejects a missing production credential with the variable name', () => {
    const environment = { ...validProductionEnvironment };
    delete (environment as Partial<typeof environment>).MIDTRANS_SERVER_KEY;

    expect(() => validateEnvironment(environment)).toThrow(
      'MIDTRANS_SERVER_KEY',
    );
  });

  it('rejects placeholder credentials in production', () => {
    expect(() =>
      validateEnvironment({
        ...validProductionEnvironment,
        WHATSAPP_ACCESS_TOKEN: 'replace-me',
      }),
    ).toThrow('WHATSAPP_ACCESS_TOKEN');
  });

  it('accepts a complete production environment', () => {
    expect(validateEnvironment(validProductionEnvironment)).toEqual(
      validProductionEnvironment,
    );
  });
});
