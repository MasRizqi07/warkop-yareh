import {
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, Role } from '@warkop-yareh/database';
import type {
  CreateUserInput,
  IUserRepository,
  UpdateUserInput,
} from '../../domain/repositories/user.repository.interface';

@Injectable()
export class IdentityService {
  constructor(
    @Inject('IUserRepository')
    private readonly userRepository: IUserRepository,
  ) {}

  async getUserProfile(userId: string) {
    return this.userRepository.findById(userId);
  }

  async getUserByEmail(email: string) {
    return this.userRepository.findByEmail(
      email.trim().toLocaleLowerCase('en-US'),
    );
  }

  async createUser(data: CreateUserInput) {
    return this.userRepository.create({
      ...data,
      email: data.email.trim().toLocaleLowerCase('en-US'),
      name: data.name.trim(),
      ...(data.phone ? { phone: data.phone.trim() } : {}),
    });
  }

  async updateUser(
    userId: string,
    data: Omit<UpdateUserInput, 'whatsAppMarketingOptInAt'> & {
      whatsAppMarketingOptIn?: boolean;
    },
  ) {
    const existing = await this.userRepository.findById(userId);
    if (!existing) throw new NotFoundException('User not found');

    try {
      return await this.userRepository.update(userId, {
        ...(data.name !== undefined ? { name: data.name.trim() } : {}),
        ...(data.phone !== undefined ? { phone: data.phone.trim() } : {}),
        ...(data.avatar !== undefined ? { avatar: data.avatar.trim() } : {}),
        ...(data.whatsAppMarketingOptIn !== undefined
          ? {
              whatsAppMarketingOptInAt: data.whatsAppMarketingOptIn
                ? (existing.whatsAppMarketingOptInAt ?? new Date())
                : null,
            }
          : {}),
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException('Phone number is already in use');
      }
      throw error;
    }
  }

  async listUsers(params: {
    page: number;
    limit: number;
    role?: Role;
    branchId?: string;
    search?: string;
  }) {
    return this.userRepository.findAll({
      ...params,
      search: params.search?.trim() || undefined,
    });
  }
}
