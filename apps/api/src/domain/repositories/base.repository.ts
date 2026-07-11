export interface IRepository<T> {
  exists(t: T): Promise<boolean>;
  delete(t: T): Promise<any>;
  findById(id: string): Promise<T | null>;
  save(t: T): Promise<T>;
}
