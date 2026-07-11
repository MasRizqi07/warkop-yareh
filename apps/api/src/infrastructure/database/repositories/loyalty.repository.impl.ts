import { Injectable } from '@nestjs/common';
import { ILoyaltyRepository } from '../../../domain/repositories/loyalty.repository';
import { Loyalty } from '../../../domain/entities/loyalty.entity';
import { DatabaseService } from '../database.service';

@Injectable()
export class LoyaltyRepositoryImpl implements ILoyaltyRepository {
  constructor(private readonly db: DatabaseService) {}

  private mapToDomain(prismaLoyalty: any): Loyalty {
    return Loyalty.create(
      {
        userId: prismaLoyalty.userId,
        pointsBalance: prismaLoyalty.pointsBalance,
        lifetimePoints: prismaLoyalty.lifetimePoints,
        tier: prismaLoyalty.tier as string,
      },
      prismaLoyalty.id,
    );
  }

  async exists(loyalty: Loyalty): Promise<boolean> {
    const found = await (this.db as any).user.findUnique({
      where: { id: loyalty.props.userId }, // Assuming loyalty properties exist on the user table, or a separate loyalty table.
    });
    return !!found;
  }

  async delete(loyalty: Loyalty): Promise<any> {
    void loyalty;
    // Loyalty is usually soft-deleted or attached to the user.
    return Promise.resolve();
  }

  async findById(id: string): Promise<Loyalty | null> {
    // Assuming Loyalty is part of user for now (or a separate model if we defined it)
    const user = await (this.db as any).user.findUnique({
      where: { id },
    });

    if (!user) return null;

    // Fallback stub since our schema may not have dedicated loyalty yet
    return Loyalty.create(
      {
        userId: user.id,
        pointsBalance: 0,
        lifetimePoints: 0,
        tier: 'BRONZE',
      },
      id,
    );
  }

  async findByUserId(userId: string): Promise<Loyalty | null> {
    return this.findById(userId); // If id is userId in 1:1 mapping
  }

  async save(loyalty: Loyalty): Promise<Loyalty> {
    // Typically updates user points or a separate table
    return loyalty;
  }
}
