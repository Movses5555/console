import { User } from '../../models/user'

export interface IAuthRepository {
  getUsers(): Promise<User[]>;
  getUserById(id: number): Promise<User>;
  createUser(name: string, email: string): Promise<User>;
  updateUser(id: number, name: string, email: string): Promise<User>;
  deleteUser(id: number): Promise<void>;
}
