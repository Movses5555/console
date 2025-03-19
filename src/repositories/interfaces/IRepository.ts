import { Pool, PoolClient } from 'pg';
import  User from '../../models/user'
import TelegramUser from '../../models/telegram-user'
import { UUID } from 'crypto';
import Mining from '../../models/mining.model';


import UpgradeBlock from '../../models/upgrade-block.model';
import UserUpgradeBlock from '../../models/user-upgrade-block.model';
import BoostBlock from '../../models/boost-block.model';
import UserBoostBlock from '../../models/user-boost-block.model';


export interface IRepository {
  createClientAndBeginTransaction(): Promise<PoolClient>;

  commitAndRelease(client: PoolClient): Promise<void>;

  rollbackAndRelease(client: PoolClient): Promise<void>;

  getUserById(
    id: UUID,
    client?: PoolClient | Pool
  ): Promise<User>;

  createUser(
    name: string,
    email: string,
    client?: PoolClient | Pool
  ): Promise<User>;

  updateUser(
    id: UUID,
    name: string,
    email: string,
    client?: PoolClient | Pool
  ): Promise<User>;

  deleteUser(
    id: UUID,
    client?: PoolClient | Pool
  ): Promise<void>;
  
  createTelegramUser(
    user: TelegramUser,
    client?: PoolClient | Pool
  ): Promise<void>;

  getUserByTelegramId(
    telegramId: number,
    client?: PoolClient | Pool
  ): Promise<User | null>;

  getTotalBalanceByUserId(
    userId: UUID,
    client?: PoolClient | Pool
  ): Promise<number>;

  createUserBalances(
    userId: UUID,
    client?: PoolClient | Pool
  ): Promise<void>;

  updateUserBalances(
    userId: UUID,
    balance: number,
    client?: PoolClient | Pool
  ): Promise<void>;
  
  createUserDayCode(
    userId: UUID,
    code: string,
    client?: PoolClient | Pool
  ): Promise<void>;
  
  getUserDayCode(
    userId: UUID,
    client?: PoolClient | Pool
  ): Promise<string>;
  
  updateUserDayCode(
    userId: UUID,
    code: string,
    client?: PoolClient | Pool
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

  isUsedDailyCode(
    userId: UUID,
    client?: PoolClient | Pool,
  ): Promise<boolean> ;

  isUsedDailyClaim(
    userId: UUID,
    client?: PoolClient | Pool,
  ): Promise<boolean> ;

  updateIsUsedDailyCode(
    userId: UUID,
    isUsedDailyCode: boolean,
    client?: PoolClient | Pool,  
  ): Promise<void>;

  updateIsUsedDailyClaim(
    userId: UUID,
    isUsedDailyClaim: boolean,
    client?: PoolClient | Pool,  
  ): Promise<void>;

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

  getAllUpgradeBlocks(
    client?: PoolClient | Pool,
  ): Promise<UpgradeBlock[]>;

  getActiveUpgradeBlocks(
    client?: PoolClient | Pool,
  ): Promise<UpgradeBlock[]>;

  updateUpgradeBlockById(
    id: UUID,
    speed: number,
    point: number,
    nativePrice: number,
    tonPrice: number,
    level: number,
    isActive: boolean,
    client?: PoolClient | Pool,
  ): Promise<void>;

  deleteUpgradeBlockById(
    id: UUID,
    client?: PoolClient | Pool
  ): Promise<void>;

  getAllBoostBlocks(
    client?: PoolClient | Pool,
  ): Promise<BoostBlock[]>;

  getActiveBoostBlocks(
    client?: PoolClient | Pool,
  ): Promise<BoostBlock[]>;

  updateBoostBlockById(
    id: UUID,
    speed: number,
    point: number,
    nativePrice: number,
    tonPrice: number,
    isFree: boolean,
    isActive: boolean,
    client?: PoolClient | Pool,
  ): Promise<void>;

  deleteBoostBlockById(
    id: UUID,
    client?: PoolClient | Pool
  ): Promise<void>;
  
  getUserUpgradeBlocks(
    userId: UUID,
    client?: PoolClient | Pool,
  ): Promise<UserUpgradeBlock[]>;

  getActiveUsersUpgradeBlocks(
    userId: UUID,
    client?: PoolClient | Pool,
  ): Promise<UpgradeBlock[]>;

  updateUsersUpgradeBlockById(
    id: UUID,
    userId: UUID,
    upgradeBlockId: UUID,
    isActive: boolean,
    speed: number,
    point: number,
    nativePrice: number,
    tonPrice: number,
    level: number,
    client?: PoolClient | Pool,
  ): Promise<void>;

  deleteUsersUpgradeBlockById(
    id: UUID,
    client?: PoolClient | Pool
  ): Promise<void>;

  getUserBoostBlocks(
    userId: UUID,
    client?: PoolClient | Pool,
  ): Promise<UserBoostBlock[]>;

  getActiveUserBoostBlocks(
    client?: PoolClient | Pool,
  ): Promise<BoostBlock[]>;

  updateUserBoostBlockById(
    id: UUID,
    userId: UUID,
    boostBlockId: UUID,
    speed: number,
    duration: number,
    tonPrice: number,
    level: number,
    isActive: boolean,
    client?: PoolClient | Pool,
  ): Promise<void>;

  deleteUserBoostBlockById(
    id: UUID,
    client?: PoolClient | Pool
  ): Promise<void>;
}
