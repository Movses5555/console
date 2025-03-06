import { User } from '../../models/user'
import TelegramUser from '../../models/telegram-user'

export interface IUserRepository {
  getUsers(): Promise<User[]>;
  getUserById(id: number): Promise<User>;
  createUser(name: string, email: string): Promise<User>;
  updateUser(id: number, name: string, email: string): Promise<User>;
  deleteUser(id: number): Promise<void>;


  createTelegramUser(user: TelegramUser): Promise<void>;
  getUserByTelegramId(telegramId: number): Promise<User | null>;
}
