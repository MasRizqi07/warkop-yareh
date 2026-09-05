import {
  Injectable,
  Logger,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as midtransClient from 'midtrans-client';
import { randomBytes } from 'node:crypto';

interface MidtransTransactionStatusResponse {
  transaction_status?: string;
  fraud_status?: string;
  status_code?: string;
}

interface MidtransCoreApiClient {
  transaction: {
    status(orderId: string): Promise<MidtransTransactionStatusResponse>;
  };
}

interface MidtransSnapClient {
  createTransaction(parameters: unknown): Promise<{
    token: string;
    redirect_url: string;
  }>;
}

@Injectable()
export class MidtransService {
  private readonly coreApi: MidtransCoreApiClient;
  private readonly snap: MidtransSnapClient;
  private readonly logger = new Logger(MidtransService.name);

  constructor(private configService: ConfigService) {
    const serverKey = this.configService.get<string>('MIDTRANS_SERVER_KEY');
    if (!serverKey && this.configService.get<string>('NODE_ENV') === 'production') {
      throw new Error('MIDTRANS_SERVER_KEY is required in production');
    }
    if (!serverKey) {
      this.logger.warn(
        'MIDTRANS_SERVER_KEY is missing! Payment gateway will not work.',
      );
    }
    this.coreApi = new midtransClient.CoreApi({
      isProduction:
        this.configService.get<string>('MIDTRANS_IS_PRODUCTION') === 'true',
      serverKey: serverKey || 'sandbox_server_key',
      clientKey:
        this.configService.get<string>('MIDTRANS_CLIENT_KEY') ||
        'sandbox_client_key',
    }) as unknown as MidtransCoreApiClient;

    this.snap = new midtransClient.Snap({
      isProduction:
        this.configService.get<string>('MIDTRANS_IS_PRODUCTION') === 'true',
      serverKey: serverKey || 'sandbox_server_key',
      clientKey:
        this.configService.get<string>('MIDTRANS_CLIENT_KEY') ||
        'sandbox_client_key',
    }) as unknown as MidtransSnapClient;
  }

  async createSnapTransaction(params: {
    orderId: string;
    grossAmount: number;
    customerDetails?: {
      firstName?: string;
      email?: string;
      phone?: string;
    };
    itemDetails?: Array<{
      id: string;
      price: number;
      quantity: number;
      name: string;
    }>;
  }) {
    const serverKey = this.configService.get<string>('MIDTRANS_SERVER_KEY');
    const isProductionEnv =
      this.configService.get<string>('NODE_ENV') === 'production';
    const isPlaceholderKey =
      !serverKey ||
      serverKey.includes('xxx') ||
      serverKey === 'sandbox_server_key';

    if (isPlaceholderKey) {
      if (isProductionEnv) {
        throw new InternalServerErrorException(
          'Midtrans Error: Cannot generate Snap token in production with missing or placeholder MIDTRANS_SERVER_KEY.',
        );
      }
      this.logger.log(
        'Midtrans server key is placeholder/missing in non-production. Generating mock snap transaction.',
      );
      const mockToken = `mock-snap-token-${randomBytes(12).toString('hex')}`;
      return {
        token: mockToken,
        redirect_url: `https://app.sandbox.midtrans.com/snap/v2/vtweb/${mockToken}`,
      };
    }

    const transactionDetails = {
      transaction_details: {
        order_id: params.orderId,
        gross_amount: params.grossAmount,
      },
      customer_details: params.customerDetails,
      item_details: params.itemDetails,
    };

    try {
      const transaction = await this.snap.createTransaction(transactionDetails);
      return transaction;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Midtrans Snap request failed: ${message}`);
      throw new BadRequestException('Unable to initialize payment transaction');
    }
  }

  async getTransactionStatus(orderId: string): Promise<{
    transactionStatus: string;
    fraudStatus?: string;
    statusCode?: string;
  }> {
    const response = await this.coreApi.transaction.status(orderId);
    return {
      transactionStatus: response.transaction_status ?? 'PAYMENT_PENDING',
      ...(response.fraud_status ? { fraudStatus: response.fraud_status } : {}),
      ...(response.status_code ? { statusCode: response.status_code } : {}),
    };
  }
}
