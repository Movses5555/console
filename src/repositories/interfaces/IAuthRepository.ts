import { User } from '../../models/user'

export interface IAuthRepository {
  getUserById(id: number): Promise<User>;
  createUser(name: string, email: string): Promise<User>;
  updateUser(id: number, name: string, email: string): Promise<User>;
  deleteUser(id: number): Promise<void>;
}
