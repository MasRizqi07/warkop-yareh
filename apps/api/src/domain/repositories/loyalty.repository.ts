import { Loyalty } from '../entities/loyalty.entity';
import { IRepository } from './base.repository';

export interface ILoyaltyRepository extends IRepository<Loyalty> {
  findByUserId(userId: string): Promise<Loyalty | null>;
}
