import type { Role, User } from '@warkop-yareh/database';

export type SafeUser = Omit<User, 'passwordHash'>;
export type InternalUser = User;

export interface CreateUserInput {
  email: string;
  name: string;
  phone?: string;
  passwordHash?: string;
  referredBy?: string;
}

export interface UpdateUserInput {
  name?: string;
  phone?: string;
  avatar?: string;
}

export interface IUserRepository {
  findById(id: string): Promise<SafeUser | null>;
  findByEmail(email: string): Promise<InternalUser | null>;
  create(data: CreateUserInput): Promise<SafeUser>;
  update(id: string, data: UpdateUserInput): Promise<SafeUser>;
  delete(id: string): Promise<void>;
  findAll(params: {
    page: number;
    limit: number;
    role?: Role;
    branchId?: string;
  }): Promise<{ data: SafeUser[]; total: number }>;
}
