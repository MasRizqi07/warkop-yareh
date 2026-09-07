import { ConfigService } from '@nestjs/config';
import { ServiceUnavailableException } from '@nestjs/common';
import { WhatsAppCloudService } from './whatsapp-cloud.service';

describe('WhatsAppCloudService', () => {
  const originalFetch = global.fetch;

  afterEach(() => {
    global.fetch = originalFetch;
    jest.restoreAllMocks();
  });

  function createService(overrides: Record<string, string> = {}) {
    const values: Record<string, string> = {
      WHATSAPP_ACCESS_TOKEN: 'access-token',
      WHATSAPP_PHONE_NUMBER_ID: '123456789',
      WHATSAPP_API_VERSION: 'v23.0',
      WHATSAPP_CAMPAIGN_TEMPLATE_NAME: 'campaign_v1',
      WHATSAPP_LANGUAGE_CODE: 'id',
      ...overrides,
    };
    const config = {
      get: jest.fn((key: string) => values[key]),
      getOrThrow: jest.fn((key: string) => {
        const value = values[key];
        if (!value) throw new Error(`Missing ${key}`);
        return value;
      }),
    };
    return new WhatsAppCloudService(config as unknown as ConfigService);
  }

  it('fails loudly when the provider is not configured', async () => {
    const service = createService({ WHATSAPP_ACCESS_TOKEN: '' });

    await expect(
      service.sendCampaignTemplate({
        phone: '081234567890',
        campaignName: 'Campaign',
        discountPercent: 10,
        expiresInHours: 24,
        includeHeaderMedia: false,
      }),
    ).rejects.toBeInstanceOf(ServiceUnavailableException);
  });

  it('normalizes an Indonesian local number and requires a provider message id', async () => {
    const fetchMock = jest.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: jest.fn().mockResolvedValue({ messages: [{ id: 'wamid.123' }] }),
    });
    global.fetch = fetchMock;
    const service = createService();

    await expect(
      service.sendCampaignTemplate({
        phone: '0812-3456-7890',
        campaignName: 'Night Owl',
        discountPercent: 15,
        expiresInHours: 24,
        includeHeaderMedia: false,
      }),
    ).resolves.toBe('wamid.123');

    const request: RequestInit | undefined = fetchMock.mock.calls[0]?.[1];
    if (typeof request?.body !== 'string') {
      throw new Error('Expected a JSON request body');
    }
    const payload = JSON.parse(request.body) as { to: string };
    expect(payload.to).toBe('6281234567890');
  });

  it('surfaces the provider error without reporting false success', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 400,
      json: jest
        .fn()
        .mockResolvedValue({ error: { message: 'Template rejected' } }),
    });
    const service = createService();

    await expect(
      service.sendCampaignTemplate({
        phone: '+6281234567890',
        campaignName: 'Campaign',
        discountPercent: 10,
        expiresInHours: 24,
        includeHeaderMedia: false,
      }),
    ).rejects.toThrow('Template rejected');
  });
});
