import { Pool, PoolClient } from 'pg';
import  User from '../../models/user'
import TelegramUser from '../../models/telegram-user'
import { UUID } from 'crypto';
import { Mining } from '../../models/mining.model';


export interface IRepository {
  createClientAndBeginTransaction(): Promise<PoolClient>;

  commitAndRelease(client: PoolClient): Promise<void>;

  rollbackAndRelease(client: PoolClient): Promise<void>;

  getUserById(
    id: UUID
  ): Promise<User>;

  createUser(
    name: string,
    email: string
  ): Promise<User>;

  updateUser(
    id: UUID,
    name: string,
    email: string
  ): Promise<User>;

  deleteUser(
    id: UUID
  ): Promise<void>;
  
  createTelegramUser(
    user: TelegramUser
  ): Promise<void>;

  getUserByTelegramId(
    telegramId: number
  ): Promise<User | null>;

  getTotalBalanceByUserId(
    userId: UUID
  ): Promise<number>;

  createUserBalances(
    userId: UUID
  ): Promise<void>;

  updateUserBalances(
    userId: UUID,
    balance: number,
  ): Promise<void>;
  
  createUserDayCode(
    userId: UUID,
    code: string
  ): Promise<void>;
  
  getUserDayCode(
    userId: UUID
  ): Promise<string>;
  
  updateUserDayCode(
    userId: UUID,
    code: string
  ): Promise<void>;

  createMining(
    userId: UUID,
    multiplier: number,
    lastClaimedAt: Date,
    client?: PoolClient | Pool
  ): Promise<void>;

  getMiningByUserId(
    userId: UUID,
    client?: PoolClient | Pool
  ): Promise<Mining | null>;
  
  updateMiningMultiplier(
    userId: string,
    multiplier: number,
    client?: PoolClient | Pool
  ): Promise<void>;

  updateMiningLastClaimedAt(
    userId: UUID,
    lastClaimedAt: Date,
    client?: PoolClient | Pool
  ): Promise<void>;

  deleteSession(
    userId: UUID,
    client?: PoolClient | Pool
  ): Promise<void>;

  createDailyCode(
    code: string,
    startAt: Date,
    endAt: Date,
    client?: PoolClient | Pool
  ): Promise<void>;

  getDailyCode(
    client?: PoolClient | Pool
  ): Promise<string>;

  isDailyCodeUsed(
    userId: UUID,
    client?: PoolClient | Pool,
  ): Promise<boolean> ;

  updateIsDailyCodeUsed(
    userId: UUID,
    isDailyCodeUsed: boolean,
    client?: PoolClient | Pool,  
  ): Promise<string>;

  updateDailyCode(
    code: string,
    startAt: Date,
    endAt: Date,
    active: boolean,
    client?: PoolClient | Pool
  ): Promise<void>;
  
  deleteDailyCode(
    code: string,
    client?: PoolClient | Pool
  ): Promise<void>;

  truncateDailyCodes(
    client?: PoolClient | Pool
  ): Promise<void>;

  getSettingsValueByKey(
    key: string,
    client?: PoolClient | Pool
  ): Promise<number>;

}
