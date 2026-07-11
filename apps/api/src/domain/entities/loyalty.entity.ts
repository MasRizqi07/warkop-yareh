import { Entity } from './base.entity';

export interface LoyaltyProps {
  userId: string;
  pointsBalance: number;
  lifetimePoints: number;
  tier: string;
}

export class Loyalty extends Entity<LoyaltyProps> {
  private constructor(props: LoyaltyProps, id?: string) {
    super(props, id);
  }

  public static create(props: LoyaltyProps, id?: string): Loyalty {
    return new Loyalty(props, id);
  }

  public addPoints(amount: number): void {
    if (amount <= 0) throw new Error('Amount must be positive');
    this.props.pointsBalance += amount;
    this.props.lifetimePoints += amount;
    this.updateTier();
  }

  public redeemPoints(amount: number): void {
    if (amount <= 0) throw new Error('Amount must be positive');
    if (this.props.pointsBalance < amount)
      throw new Error('Insufficient points');
    this.props.pointsBalance -= amount;
  }

  private updateTier(): void {
    if (this.props.lifetimePoints >= 10000) this.props.tier = 'PLATINUM';
    else if (this.props.lifetimePoints >= 5000) this.props.tier = 'GOLD';
    else if (this.props.lifetimePoints >= 1000) this.props.tier = 'SILVER';
    else this.props.tier = 'BRONZE';
  }
}
