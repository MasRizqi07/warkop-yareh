import { Injectable, Inject } from '@nestjs/common';
import type { ILoyaltyRepository } from '../../../domain/repositories/loyalty.repository';
import { Loyalty } from '../../../domain/entities/loyalty.entity';

@Injectable()
export class GetLoyaltyStatusUseCase {
  constructor(
    @Inject('ILoyaltyRepository')
    private readonly loyaltyRepository: ILoyaltyRepository,
  ) {}

  async execute(userId: string): Promise<Loyalty> {
    let loyalty = await this.loyaltyRepository.findByUserId(userId);

    if (!loyalty) {
      // Create new loyalty profile if it doesn't exist
      loyalty = Loyalty.create({
        userId,
        pointsBalance: 0,
        lifetimePoints: 0,
        tier: 'BRONZE',
      });
      await this.loyaltyRepository.save(loyalty);
    }

    return loyalty;
  }
}
