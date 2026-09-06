import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@warkop-yareh/database';
import { randomBytes } from 'node:crypto';
import { DatabaseService } from '../../../../infrastructure/database/database.service';

interface CreateBranchInput {
  name: string;
  address: string;
  city?: string;
  province?: string;
  postalCode?: string;
  phone?: string;
  email?: string;
  latitude?: number;
  longitude?: number;
  weekdayHours?: string;
  weekendHours?: string;
  capacity?: number;
  features?: string[];
}

interface UpdateBranchInput extends Partial<CreateBranchInput> {
  isActive?: boolean;
}

const publicBranchSelect = Prisma.validator<Prisma.BranchSelect>()({
  id: true,
  name: true,
  slug: true,
  address: true,
  city: true,
  province: true,
  postalCode: true,
  phone: true,
  email: true,
  latitude: true,
  longitude: true,
  isMainBranch: true,
  capacity: true,
  features: true,
  weekdayHours: true,
  weekendHours: true,
});

@Injectable()
export class BranchService {
  constructor(private readonly prisma: DatabaseService) {}

  async createBranch(data: CreateBranchInput) {
    const weekdayHours = data.weekdayHours ?? '07:00-24:00';
    const weekendHours = data.weekendHours ?? '07:00-01:00';
    this.assertHours(weekdayHours, 'weekdayHours');
    this.assertHours(weekendHours, 'weekendHours');
    const slugBase =
      data.name
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '') || 'branch';

    try {
      return await this.prisma.branch.create({
        data: {
          name: data.name.trim(),
          slug: `${slugBase}-${randomBytes(3).toString('hex')}`,
          address: data.address.trim(),
          city: data.city?.trim() || 'Surabaya',
          province: data.province?.trim() || 'Jawa Timur',
          postalCode: data.postalCode?.trim() || null,
          phone: data.phone?.trim() || null,
          email: data.email?.trim().toLowerCase() || null,
          latitude: data.latitude,
          longitude: data.longitude,
          weekdayHours,
          weekendHours,
          capacity: data.capacity ?? 0,
          features: data.features?.map((feature) => feature.trim()) ?? [],
        },
        select: publicBranchSelect,
      });
    } catch (error: unknown) {
      if (this.getPrismaErrorCode(error) === 'P2002') {
        throw new ConflictException('Branch identifier already exists');
      }
      throw error;
    }
  }

  async getBranch(id: string) {
    const branch = await this.prisma.branch.findFirst({
      where: { id, isActive: true, deletedAt: null },
      select: publicBranchSelect,
    });
    if (!branch) throw new NotFoundException('Branch not found');
    return branch;
  }

  async listBranches() {
    return this.prisma.branch.findMany({
      where: { isActive: true, deletedAt: null },
      select: publicBranchSelect,
      orderBy: [{ isMainBranch: 'desc' }, { name: 'asc' }],
    });
  }

  async updateBranch(id: string, data: UpdateBranchInput) {
    const exists = await this.prisma.branch.findFirst({
      where: { id, deletedAt: null },
      select: { id: true },
    });
    if (!exists) throw new NotFoundException('Branch not found');
    if (data.weekdayHours) this.assertHours(data.weekdayHours, 'weekdayHours');
    if (data.weekendHours) this.assertHours(data.weekendHours, 'weekendHours');

    const update: Prisma.BranchUncheckedUpdateInput = {
      ...(data.name !== undefined ? { name: data.name.trim() } : {}),
      ...(data.address !== undefined ? { address: data.address.trim() } : {}),
      ...(data.city !== undefined ? { city: data.city.trim() } : {}),
      ...(data.province !== undefined
        ? { province: data.province.trim() }
        : {}),
      ...(data.postalCode !== undefined
        ? { postalCode: data.postalCode.trim() || null }
        : {}),
      ...(data.phone !== undefined ? { phone: data.phone.trim() || null } : {}),
      ...(data.email !== undefined
        ? { email: data.email.trim().toLowerCase() || null }
        : {}),
      ...(data.latitude !== undefined ? { latitude: data.latitude } : {}),
      ...(data.longitude !== undefined ? { longitude: data.longitude } : {}),
      ...(data.weekdayHours !== undefined
        ? { weekdayHours: data.weekdayHours }
        : {}),
      ...(data.weekendHours !== undefined
        ? { weekendHours: data.weekendHours }
        : {}),
      ...(data.capacity !== undefined ? { capacity: data.capacity } : {}),
      ...(data.features !== undefined
        ? { features: data.features.map((feature) => feature.trim()) }
        : {}),
      ...(data.isActive !== undefined ? { isActive: data.isActive } : {}),
    };
    if (Object.keys(update).length === 0) {
      throw new BadRequestException('At least one branch field is required');
    }
    return this.prisma.branch.update({
      where: { id },
      data: update,
      select: publicBranchSelect,
    });
  }

  private assertHours(value: string, field: string): void {
    const match = value.match(
      /^((?:[01]\d|2[0-3]):[0-5]\d|24:00)-((?:[01]\d|2[0-3]):[0-5]\d|24:00)$/,
    );
    if (!match) {
      throw new BadRequestException(`${field} must use HH:mm-HH:mm format`);
    }
  }

  private getPrismaErrorCode(error: unknown): string | undefined {
    if (error instanceof Prisma.PrismaClientKnownRequestError)
      return error.code;
    if (typeof error === 'object' && error !== null && 'code' in error) {
      const code = Reflect.get(error, 'code');
      return typeof code === 'string' ? code : undefined;
    }
    return undefined;
  }
}
