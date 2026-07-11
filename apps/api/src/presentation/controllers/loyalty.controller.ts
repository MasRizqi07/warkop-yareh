import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { GetLoyaltyStatusUseCase } from '../../application/use-cases/loyalty/get-loyalty-status.use-case';
import { JwtAuthGuard } from '../../infrastructure/auth/jwt-auth.guard';

@Controller('loyalty')
export class LoyaltyController {
  constructor(
    private readonly getLoyaltyStatusUseCase: GetLoyaltyStatusUseCase,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Get('status')
  async getStatus(@Request() req: any) {
    const result = await this.getLoyaltyStatusUseCase.execute(req.user.id);

    return {
      data: {
        id: result.id,
        ...result.props,
      },
    };
  }
}
