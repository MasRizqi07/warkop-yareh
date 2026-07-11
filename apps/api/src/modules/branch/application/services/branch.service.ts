import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../../../infrastructure/database/database.service';

@Injectable()
export class BranchService {
  constructor(private readonly prisma: DatabaseService) {}

  async createBranch(data: {
    name: string;
    address: string;
    city?: string;
    province?: string;
    phone?: string;
    latitude?: number;
    longitude?: number;
    weekdayHours?: string;
    weekendHours?: string;
  }) {
    const slug = data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    return this.prisma.branch.create({
      data: {
        name: data.name,
        slug,
        address: data.address,
        city: data.city || 'Surabaya',
        province: data.province || 'Jawa Timur',
        phone: data.phone,
        latitude: data.latitude,
        longitude: data.longitude,
        weekdayHours: data.weekdayHours || '07:00-24:00',
        weekendHours: data.weekendHours || '07:00-01:00',
      },
    });
  }

  async getBranch(id: string) {
    return this.prisma.branch.findUnique({
      where: { id },
      include: {
        tables: true,
      },
    });
  }

  async listBranches() {
    return this.prisma.branch.findMany({
      include: {
        _count: { select: { tables: true, orders: true } },
      },
    });
  }

  async updateBranch(
    id: string,
    data: Partial<{
      name: string;
      address: string;
      city: string;
      province: string;
      phone: string;
      latitude: number;
      longitude: number;
      weekdayHours: string;
      weekendHours: string;
      isActive: boolean;
    }>,
  ) {
    return this.prisma.branch.update({
      where: { id },
      data,
    });
  }
}
