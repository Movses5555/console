import  User from '../../models/user'
import { UUID } from 'crypto';

export default interface IUserService {
  createUser(name: string, email: string): Promise<any>;
  getUserById(id: UUID): Promise<User>;
  getTotalBalanceByUserId(userId: UUID): Promise<number>;
  isActiveDailyCode(code: string): Promise<boolean>;
  getDailyCodePoint(): Promise<number>;
}

