import { Injectable } from '@nestjs/common';
import { Prisma } from '@warkop-yareh/database';
import { DatabaseService } from '../../../../infrastructure/database/database.service';
import {
  CreateUserInput,
  IUserRepository,
  UpdateUserInput,
} from '../../domain/repositories/user.repository.interface';

const safeUserSelect = Prisma.validator<Prisma.UserSelect>()({
  id: true,
  email: true,
  phone: true,
  name: true,
  avatar: true,
  role: true,
  membershipTier: true,
  loyaltyPoints: true,
  referralCode: true,
  referredBy: true,
  branchId: true,
  createdAt: true,
  updatedAt: true,
  deletedAt: true,
});

@Injectable()
export class PrismaUserRepository implements IUserRepository {
  constructor(private readonly prisma: DatabaseService) {}

  async findById(id: string) {
    return this.prisma.user.findFirst({
      where: { id, deletedAt: null },
      select: safeUserSelect,
    });
  }

  async findByEmail(email: string) {
    return this.prisma.user.findFirst({
      where: { email, deletedAt: null },
    });
  }

  async create(data: CreateUserInput) {
    return this.prisma.user.create({ data, select: safeUserSelect });
  }

  async update(id: string, data: UpdateUserInput) {
    return this.prisma.user.update({
      where: { id },
      data,
      select: safeUserSelect,
    });
  }

  async delete(id: string) {
    await this.prisma.user.update({
      where: { id },
      data: { deletedAt: new Date() },
      select: { id: true },
    });
  }

  async findAll(params: {
    page: number;
    limit: number;
    role?: import('@warkop-yareh/database').Role;
    branchId?: string;
  }) {
    const { page, limit, role, branchId } = params;
    const where: Prisma.UserWhereInput = {
      deletedAt: null,
      ...(role ? { role } : {}),
      ...(branchId ? { branchId } : {}),
    };
    const [data, total] = await this.prisma.$transaction([
      this.prisma.user.findMany({
        where,
        select: safeUserSelect,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.user.count({ where }),
    ]);
    return { data, total };
  }
}
