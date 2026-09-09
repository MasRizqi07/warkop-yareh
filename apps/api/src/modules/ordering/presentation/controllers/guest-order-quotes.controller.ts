import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Public } from '../../../../common/decorators/public.decorator';
import { OrderingService } from '../../application/services/ordering.service';
import { GuestOrderQuoteDto } from '../dtos/order.dto';

@ApiTags('orders')
@Controller('api/v1/orders')
export class GuestOrderQuotesController {
  constructor(private readonly orderingService: OrderingService) {}

  @Post('quote/guest')
  @HttpCode(HttpStatus.OK)
  @Public()
  @ApiOperation({
    summary:
      'Calculate public branch prices and fees without account-specific discounts',
  })
  async quote(@Body() body: GuestOrderQuoteDto) {
    return {
      data: await this.orderingService.quoteOrder({
        branchId: body.branchId,
        items: body.items,
        type: body.type,
        tableId: body.tableId,
        notes: body.notes,
      }),
    };
  }
}
