/* eslint-disable */
import { Injectable, Inject } from '@nestjs/common';
import { IUserRepository } from '../../domain/repositories/user.repository.interface';

@Injectable()
export class IdentityService {
  constructor(
    @Inject('IUserRepository')
    private readonly userRepository: any,
  ) {}

  async getUserProfile(userId: string) {
    return this.userRepository.findById(userId);
  }

  async getUserByEmail(email: string) {
    return this.userRepository.findByEmail(email);
  }

  async createUser(data: {
    email: string;
    name: string;
    phone?: string;
    passwordHash?: string;
    referredBy?: string;
  }) {
    return this.userRepository.create(data);
  }

  async updateUser(
    userId: string,
    data: Partial<{ name: string; phone: string; avatar: string }>,
  ) {
    return this.userRepository.update(userId, data);
  }

  async listUsers(params: { page: number; limit: number; role?: string }) {
    return this.userRepository.findAll(params);
  }
}
