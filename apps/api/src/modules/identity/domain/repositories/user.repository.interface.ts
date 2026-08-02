/* eslint-disable */
export interface IUserRepository {
  findById(id: string): Promise<any | null>;
  findByEmail(email: string): Promise<any | null>;
  create(data: any): Promise<any>;
  update(id: string, data: any): Promise<any>;
  delete(id: string): Promise<void>;
  findAll(params: {
    page: number;
    limit: number;
    role?: string;
  }): Promise<{ data: any[]; total: number }>;
}
