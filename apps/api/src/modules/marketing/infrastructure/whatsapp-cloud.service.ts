import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

interface WhatsAppResponse {
  messages?: Array<{ id?: string }>;
  error?: { message?: string };
}

@Injectable()
export class WhatsAppCloudService {
  constructor(private readonly config: ConfigService) {}

  get configured(): boolean {
    return Boolean(
      this.config.get<string>('WHATSAPP_ACCESS_TOKEN') &&
      this.config.get<string>('WHATSAPP_PHONE_NUMBER_ID') &&
      this.config.get<string>('WHATSAPP_API_VERSION') &&
      this.config.get<string>('WHATSAPP_CAMPAIGN_TEMPLATE_NAME') &&
      this.config.get<string>('WHATSAPP_LANGUAGE_CODE'),
    );
  }

  assertConfigured(): void {
    if (!this.configured) {
      throw new ServiceUnavailableException(
        'WhatsApp Cloud API is not configured',
      );
    }
  }

  async sendCampaignTemplate(input: {
    phone: string;
    campaignName: string;
    discountPercent: number;
    expiresInHours: number;
    includeHeaderMedia: boolean;
  }): Promise<string> {
    this.assertConfigured();
    const accessToken = this.config.getOrThrow<string>('WHATSAPP_ACCESS_TOKEN');
    const phoneNumberId = this.config.getOrThrow<string>(
      'WHATSAPP_PHONE_NUMBER_ID',
    );
    const apiVersion = this.config.getOrThrow<string>('WHATSAPP_API_VERSION');
    const templateName = this.config.getOrThrow<string>(
      'WHATSAPP_CAMPAIGN_TEMPLATE_NAME',
    );
    const languageCode = this.config.getOrThrow<string>(
      'WHATSAPP_LANGUAGE_CODE',
    );
    if (!/^v\d+\.\d+$/.test(apiVersion)) {
      throw new ServiceUnavailableException(
        'WHATSAPP_API_VERSION must use the vNN.N format',
      );
    }

    const headerImageUrl = this.config.get<string>('WHATSAPP_HEADER_IMAGE_URL');
    if (input.includeHeaderMedia && !headerImageUrl) {
      throw new ServiceUnavailableException(
        'WHATSAPP_HEADER_IMAGE_URL is required for media campaigns',
      );
    }

    const response = await fetch(
      `https://graph.facebook.com/${apiVersion}/${encodeURIComponent(phoneNumberId)}/messages`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          to: this.normalizePhone(input.phone),
          type: 'template',
          template: {
            name: templateName,
            language: { code: languageCode },
            components: [
              ...(input.includeHeaderMedia && headerImageUrl
                ? [
                    {
                      type: 'header',
                      parameters: [
                        { type: 'image', image: { link: headerImageUrl } },
                      ],
                    },
                  ]
                : []),
              {
                type: 'body',
                parameters: [
                  { type: 'text', text: input.campaignName },
                  { type: 'text', text: `${input.discountPercent}%` },
                  { type: 'text', text: String(input.expiresInHours) },
                ],
              },
            ],
          },
        }),
        signal: AbortSignal.timeout(10_000),
      },
    );
    const payload = (await response
      .json()
      .catch(() => ({}))) as WhatsAppResponse;
    const messageId = payload.messages?.[0]?.id;
    if (!response.ok || !messageId) {
      throw new ServiceUnavailableException(
        payload.error?.message
          ? `WhatsApp provider rejected the message: ${payload.error.message}`
          : `WhatsApp provider rejected the message (${response.status})`,
      );
    }
    return messageId;
  }

  private normalizePhone(phone: string): string {
    const digits = phone.replace(/\D/g, '');
    if (digits.length < 8 || digits.length > 15) {
      throw new ServiceUnavailableException(
        'WhatsApp recipient phone number is invalid',
      );
    }
    return digits.startsWith('0') ? `62${digits.slice(1)}` : digits;
  }
}
