import {
  Injectable,
  Logger,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as midtransClient from 'midtrans-client';

@Injectable()
export class MidtransService {
  public coreApi: any;
  public snap: any;
  private readonly logger = new Logger(MidtransService.name);

  constructor(private configService: ConfigService) {
    const serverKey = this.configService.get<string>('MIDTRANS_SERVER_KEY');
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
    });

    this.snap = new midtransClient.Snap({
      isProduction:
        this.configService.get<string>('MIDTRANS_IS_PRODUCTION') === 'true',
      serverKey: serverKey || 'sandbox_server_key',
      clientKey:
        this.configService.get<string>('MIDTRANS_CLIENT_KEY') ||
        'sandbox_client_key',
    });
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
      const mockToken = `mock-snap-token-${Math.random().toString(36).substring(2, 10)}`;
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
    } catch (error: any) {
      throw new BadRequestException(`Midtrans Error: ${error.message}`);
    }
  }
}
