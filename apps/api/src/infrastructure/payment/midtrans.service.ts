import {
  Injectable,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as midtransClient from 'midtrans-client';

interface MidtransTransactionStatusResponse {
  gross_amount?: string;
  order_id?: string;
  transaction_status?: string;
  fraud_status?: string;
  status_code?: string;
}

interface MidtransCoreApiClient {
  httpClient: { http_client: { defaults: { timeout: number } } };
  transaction: {
    status(orderId: string): Promise<MidtransTransactionStatusResponse>;
  };
}

interface MidtransSnapClient {
  httpClient: { http_client: { defaults: { timeout: number } } };
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
    const clientKey = this.configService.get<string>('MIDTRANS_CLIENT_KEY');
    if (
      (!serverKey || !clientKey) &&
      this.configService.get<string>('NODE_ENV') === 'production'
    ) {
      throw new Error(
        'MIDTRANS_SERVER_KEY and MIDTRANS_CLIENT_KEY are required in production',
      );
    }
    if (!serverKey || !clientKey) {
      this.logger.warn(
        'Midtrans credentials are incomplete. Payment gateway will not work.',
      );
    }
    this.coreApi = new midtransClient.CoreApi({
      isProduction:
        this.configService.get<string>('MIDTRANS_IS_PRODUCTION') === 'true',
      serverKey: serverKey || 'sandbox_server_key',
      clientKey: clientKey || 'sandbox_client_key',
    }) as unknown as MidtransCoreApiClient;

    this.snap = new midtransClient.Snap({
      isProduction:
        this.configService.get<string>('MIDTRANS_IS_PRODUCTION') === 'true',
      serverKey: serverKey || 'sandbox_server_key',
      clientKey: clientKey || 'sandbox_client_key',
    }) as unknown as MidtransSnapClient;
    this.coreApi.httpClient.http_client.defaults.timeout = 10_000;
    this.snap.httpClient.http_client.defaults.timeout = 10_000;
  }

  async createSnapTransaction(params: {
    orderId: string;
    grossAmount: number;
    enabledPayments?: string[];
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
    const clientKey = this.configService.get<string>('MIDTRANS_CLIENT_KEY');
    const isPlaceholderKey =
      !serverKey ||
      !clientKey ||
      serverKey.includes('xxx') ||
      clientKey.includes('xxx') ||
      serverKey === 'sandbox_server_key' ||
      clientKey === 'sandbox_client_key';

    if (isPlaceholderKey) {
      throw new ServiceUnavailableException(
        'Payment gateway is not configured',
      );
    }

    const transactionDetails = {
      transaction_details: {
        order_id: params.orderId,
        gross_amount: params.grossAmount,
      },
      customer_details: params.customerDetails
        ? {
            first_name: params.customerDetails.firstName,
            email: params.customerDetails.email,
            phone: params.customerDetails.phone,
          }
        : undefined,
      item_details: params.itemDetails,
      enabled_payments: params.enabledPayments,
      expiry: { unit: 'minutes', duration: 15 },
    };

    try {
      const transaction = await this.snap.createTransaction(transactionDetails);
      return transaction;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Midtrans Snap request failed: ${message}`);
      throw new ServiceUnavailableException(
        'Unable to initialize payment transaction',
      );
    }
  }

  async getTransactionStatus(orderId: string): Promise<{
    transactionStatus: string;
    fraudStatus?: string;
    statusCode?: string;
    grossAmount?: string;
    orderId?: string;
  }> {
    const response = await this.coreApi.transaction.status(orderId);
    return {
      transactionStatus: response.transaction_status ?? 'PAYMENT_PENDING',
      grossAmount: response.gross_amount,
      orderId: response.order_id,
      ...(response.fraud_status ? { fraudStatus: response.fraud_status } : {}),
      ...(response.status_code ? { statusCode: response.status_code } : {}),
    };
  }
}
