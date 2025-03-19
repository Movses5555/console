import { inject, injectable } from 'inversify';
import pg, { Pool, PoolClient, types } from 'pg';
import { DateTime } from 'luxon';
import { randomUUID, UUID } from 'crypto';

import BaseRepository from './base-repository';
import { IRepository } from './interfaces/IRepository';
import pool from '../config/db';
import TelegramUser from '../models/telegram-user';
import Mining from '../models/mining.model';
import UpgradeBlock from '../models/upgrade-block.model';
import UserUpgradeBlock from '../models/user-upgrade-block.model';
import BoostBlock from '../models/boost-block.model';
import UserBoostBlock from '../models/user-boost-block.model';
import { TYPES } from '../di/types';

import DomainError from '../errors/domain.error';


@injectable()
export default class Repository
  extends BaseRepository
  implements IRepository
{
  private pool: Pool;

  constructor(@inject(TYPES.Pool) pool: Pool) {
    super();
    types.setTypeParser(types.builtins.TIMESTAMPTZ, (stringValue) =>
      DateTime.fromSQL(stringValue, { zone: 'utc' })
    );
    this.pool = pool;
  }

  async createClientAndBeginTransaction(): Promise<PoolClient> {
    const client = await this.pool.connect();
    await client.query('BEGIN');
    return client;
  }

  async commitAndRelease(client: PoolClient): Promise<void> {
    try {
      await client.query('COMMIT');
    } finally {
      client.release();
    }
  }

  async rollbackAndRelease(client: PoolClient): Promise<void> {
    try {
      await client.query('ROLLBACK');
    } finally {
      client.release();
    }
  }

  async connect() {
    const pool = new pg.Pool({
      connectionString: process.env.DATABASE_URL,
    });
    await pool.query('SELECT 1');
    this.pool = pool;

    this.setConnectionReady();
  }

  async disconnect(): Promise<void> {
    await this.pool?.end();
  }


  // auth
  async getUserById(id: UUID, client?: PoolClient | Pool): Promise<any> {
    const queryClient = client ?? this.pool;
    const result = await queryClient.query('SELECT * FROM users WHERE id = $1', [id]);
    return result.rows[0];
  }

  async createUser(name: string, email: string, client?: PoolClient | Pool): Promise<any> {
    const queryClient = client ?? this.pool;
    const result = await queryClient.query(
      'INSERT INTO users (name, email) VALUES ($1, $2) RETURNING *',
      [name, email]
    );
    return result.rows[0];
  }

  async updateUser(id: UUID, name: string, email: string, client?: PoolClient | Pool): Promise<any> {
    const queryClient = client ?? this.pool;
    const result = await queryClient.query(
      'UPDATE users SET name = $1, email = $2 WHERE id = $3 RETURNING *',
      [name, email, id]
    );
    return result.rows[0];
  }

  async deleteUser(id: UUID, client?: PoolClient | Pool): Promise<any> {
    const queryClient = client ?? this.pool;
    await queryClient.query('DELETE FROM users WHERE id = $1', [id]);
  }


  // user

  async createTelegramUser(user: TelegramUser, client?: PoolClient | Pool): Promise<void> {
    const queryClient = client ?? this.pool;
    const { id, username, photo_url} = user;
    await queryClient.query(
      'INSERT INTO users(id, telegram_id, username, photo_url) VALUES($1, $2, $3, $4)',
      [randomUUID(), id, username, photo_url],
    );
  }

  async getUserByTelegramId(id: number, client?: PoolClient | Pool): Promise<any> {
    const queryClient = client ?? this.pool;
    const result = await queryClient.query('SELECT * FROM users WHERE telegram_id = $1', [id]);
    return result.rows[0];
  }

  async getTotalBalanceByUserId(userId: UUID, client?: PoolClient | Pool): Promise<number> {
    const queryClient = client ?? this.pool;
    const result = await queryClient.query(
      'SELECT total_balance FROM balances WHERE user_id = $1',
      [userId],
    );
    return result.rows?.[0]?.total_balance || 0;
  }

  async createUserBalances(userId: UUID, client?: PoolClient | Pool): Promise<void> {    
    const queryClient = client ?? this.pool;
    await queryClient.query(
      'INSERT INTO balances(id, user_id) VALUES($1, $2)',
      [randomUUID(), userId],
    );
  }

  async updateUserBalances(
    userId: UUID,
    balance: number,
    client?: PoolClient | Pool
  ): Promise<void> {    
    const queryClient = client ?? this.pool;
    await queryClient.query(
      'UPDATE balances SET total_balance = $1 WHERE user_id = $2',
      [balance, userId],
    );
  }

  async createUserDayCode(userId: UUID, code: string, client?: PoolClient | Pool): Promise<void> {
    const queryClient = client ?? this.pool;
    await queryClient.query(
      'INSERT INTO daily_code(id, user_id, code) VALUES($1, $2, $3)',
      [randomUUID(), userId, code],
    );
  }

  async getUserDayCode(userId: UUID, client?: PoolClient | Pool): Promise<string> {
    const queryClient = client ?? this.pool;
    const result = await queryClient.query(
      'SELECT code FROM daily_code WHERE id = $1',
      [userId],
    );
    return result.rows[0];
  }
  
  async updateUserDayCode(userId: UUID, code: string, client?: PoolClient | Pool): Promise<void> { 
    const queryClient = client ?? this.pool;   
    await queryClient.query(
      'UPDATE daily_code SET code = $1 WHERE user_id = $2',
      [code, userId],
    );
  }
  
  async isUsedDailyCode(
    userId: UUID,
    client?: PoolClient | Pool,
  ): Promise<boolean> {
    const queryClient = client ?? this.pool;

    const result = await queryClient.query(
      'SELECT is_used_daily_code FROM users WHERE id = $1',
      [userId],
    );
        
    return result.rows[0]?.is_used_daily_code;
  }

  async isUsedDailyClaim(
    userId: UUID,
    client?: PoolClient | Pool,
  ): Promise<boolean> {
    const queryClient = client ?? this.pool;

    const result = await queryClient.query(
      'SELECT is_used_daily_claim FROM users WHERE id = $1',
      [userId],
    );

    return result.rows[0]?.is_used_daily_claim;
  }

  async updateIsUsedDailyCode(
    userId: UUID,
    isUsedDailyCode: boolean,
    client?: PoolClient | Pool,  
  ): Promise<void> {
    const queryClient = client ?? this.pool;

    const result = await queryClient.query(
      'UPDATE users SET is_used_daily_code = $1 WHERE id = $2 RETURNING *',
      [isUsedDailyCode, userId],
    );

    return result.rows[0];
  }

  async updateIsUsedDailyClaim(
    userId: UUID,
    isUsedDailyClaim: boolean,
    client?: PoolClient | Pool,  
  ): Promise<void> {
    const queryClient = client ?? this.pool;

    const result = await queryClient.query(
      'UPDATE users SET is_used_daily_claim = $1 WHERE id = $2 RETURNING *',
      [isUsedDailyClaim, userId],
    );

    return result.rows[0];
  }


  // mining

  async createMining(
    userId: UUID,
    multiplier: number,
    lastClaimedAt: Date,
    client?: PoolClient | Pool
  ): Promise<void> {
    const queryClient = client ?? this.pool;

    await queryClient.query(
      `INSERT INTO mining_sessions (user_id, multiplier, last_claimed_at) VALUES ($1, $2, $3)`,
      [userId, multiplier, lastClaimedAt]
    );
  }

  async getMiningByUserId(
    userId: UUID,
    client?: PoolClient | Pool
  ): Promise<Mining | null> {
    const queryClient = client ?? this.pool;

    const result = await queryClient.query(
      'SELECT * FROM mining_sessions WHERE user_id = $1',
      [userId]
    );

    return result.rows.length > 0 ? result.rows[0] : null;
  }


  async updateMiningMultiplier(
    userId: string,
    multiplier: number,
    client?: PoolClient | Pool
  ): Promise<void> {
    const queryClient = client ?? this.pool;
    await queryClient.query(
      'UPDATE mining_sessions SET multiplier = $1 WHERE user_id = $2',
      [multiplier, userId]
    );
  }

  async updateMiningLastClaimedAt(
    userId: UUID,
    lastClaimedAt: Date,
    client?: PoolClient | Pool
  ): Promise<void> {
    const queryClient = client ?? this.pool;
    await queryClient.query(
      'UPDATE mining_sessions SET last_claimed_at = $1 WHERE user_id = $2',
      [lastClaimedAt, userId]
    );
  }

  async deleteSession(
    userId: UUID,
    client?: PoolClient | Pool
  ): Promise<void> {
    const queryClient = client ?? this.pool;

    await queryClient.query(
      'DELETE FROM mining_sessions WHERE user_id = $1',
      [userId]
    );
  }


  // common

  async createDailyCode(
    code: string,
    startAt: Date,
    endAt: Date,
    client?: PoolClient | Pool
  ): Promise<void> {
    const queryClient = client ?? this.pool;

    await queryClient.query(
      `INSERT INTO daily_code (code, start_at, end_at, active) VALUES ($1, $2, $3, $4)`,
      [code, startAt, endAt, true]
    );
  }

  async getDailyCode(
    client?: PoolClient | Pool
  ): Promise<string> {
    const queryClient = client ?? this.pool;

    const result = await queryClient.query(
      `SELECT code FROM daily_code WHERE active = $1`,
      [true]
    );
    
    return result.rows.length > 0 ? result.rows[0].code : '';
  }

  async updateDailyCode(
    code: string,
    startAt: Date,
    endAt: Date,
    active: boolean,
    client?: PoolClient | Pool
  ): Promise<void> {
    const queryClient = client ?? this.pool;

    await queryClient.query(
      `UPDATE daily_code SET code = $1, start_at = $2, end_at = $3, active = $4 WHERE code = $1`,
      [code, startAt, endAt, active]
    );
  }

  async deleteDailyCode(
    code: string,
    client?: PoolClient | Pool
  ): Promise<void> {
    const queryClient = client ?? this.pool;

    await queryClient.query(
      'DELETE FROM daily_code WHERE code = $1',
      [code]
    );
  }

  async truncateDailyCodes(
    client?: PoolClient | Pool
  ): Promise<void> {
    const queryClient = client ?? this.pool;

    await queryClient.query(
      `TRUNCATE daily_code RESTART IDENTITY`
    );
  }


  async getSettingsValueByKey(
    key: string,
    client?: PoolClient | Pool,
  ): Promise<number> {
    const queryClient = client ?? this.pool;
    
    const result = await queryClient.query(
      `SELECT * FROM settings WHERE key = $1`,
      [key]
    );

    return result.rows.length > 0 ? result.rows[0].value : '';
  }


  // START upgrade_blocks

  async getAllUpgradeBlocks(
    client?: PoolClient | Pool,
  ): Promise<UpgradeBlock[]> {
    const queryClient = client ?? this.pool;
    
    const result = await queryClient.query(
      `SELECT * FROM upgrade_blocks`
    );

    return result.rows.length > 0 ? result.rows[0].value : [];
  }

  async getActiveUpgradeBlocks(
    client?: PoolClient | Pool,
  ): Promise<UpgradeBlock[]> {
    const queryClient = client ?? this.pool;
    
    const result = await queryClient.query(
      `SELECT * FROM upgrade_blocks WHERE is_active = $1`,
      [true]
    );

    return result.rows.length > 0 ? result.rows : [];
  }

  async updateUpgradeBlockById(
    id: UUID,
    speed: number,
    point: number,
    nativePrice: number,
    tonPrice: number,
    level: number,
    isActive: boolean,
    client?: PoolClient | Pool,
  ): Promise<void> {
    const queryClient = client ?? this.pool;
    
    await queryClient.query(
      `UPDATE upgrade_blocks SET speed = $1, point = $2, native_price = $3, ton_price = $4, level = $5, is_active = $6 WHERE id = $7`,
      [speed, point, nativePrice, tonPrice, level, isActive, id]
    );
  }

  async deleteUpgradeBlockById(
    id: UUID,
    client?: PoolClient | Pool
  ): Promise<void> {
    const queryClient = client ?? this.pool;

    await queryClient.query(
      'DELETE FROM upgrade_blocks WHERE id = $1',
      [id]
    );
  }

  
  // START boost_blocks

  async getAllBoostBlocks(
    client?: PoolClient | Pool,
  ): Promise<BoostBlock[]> {
    const queryClient = client ?? this.pool;
    
    const result = await queryClient.query(
      `SELECT * FROM boost_blocks`
    );

    return result.rows.length > 0 ? result.rows[0].value : [];
  }

  async getActiveBoostBlocks(
    client?: PoolClient | Pool,
  ): Promise<BoostBlock[]> {
    const queryClient = client ?? this.pool;
    
    const result = await queryClient.query(
      `SELECT * FROM boost_blocks WHERE is_active = $1`,
      [true]
    );

    return result.rows.length > 0 ? result.rows : [];
  }

  async updateBoostBlockById(
    id: UUID,
    speed: number,
    point: number,
    nativePrice: number,
    tonPrice: number,
    isFree: boolean,
    isActive: boolean,
    client?: PoolClient | Pool,
  ): Promise<void> {
    const queryClient = client ?? this.pool;
    
    await queryClient.query(
      `UPDATE boost_blocks SET speed = $1, point = $2, native_price = $3, ton_price = $4, is_free = $5, is_active = $6 WHERE id = $7`,
      [speed, point, nativePrice, tonPrice, isFree, isActive, id]
    );
  }

  async deleteBoostBlockById(
    id: UUID,
    client?: PoolClient | Pool
  ): Promise<void> {
    const queryClient = client ?? this.pool;

    await queryClient.query(
      'DELETE FROM boost_blocks WHERE id = $1',
      [id]
    );
  }



  // START users_upgrade_blocks

  async getUserUpgradeBlocks(
    userId: UUID,
    client?: PoolClient | Pool,
  ): Promise<UserUpgradeBlock[]> {
    const queryClient = client ?? this.pool;
    
    const result = await queryClient.query(
      `SELECT * FROM users_upgrade_blocks WHERE  user_id = $1`,
      [userId]
    );

    return result.rows.length > 0 ? result.rows : [];
  }

  async getActiveUsersUpgradeBlocks(
    userId: UUID,
    client?: PoolClient | Pool,
  ): Promise<UpgradeBlock[]> {
    const queryClient = client ?? this.pool;
    
    const result = await queryClient.query(
      `SELECT * FROM users_upgrade_blocks WHERE user_id = $1, is_active = $2`,
      [userId, true]
    );

    return result.rows.length > 0 ? result.rows[0].value : [];
  }

  async updateUsersUpgradeBlockById(
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
  ): Promise<void> {
    const queryClient = client ?? this.pool;
    
    await queryClient.query(
      `UPDATE users_upgrade_blocks SET user_id = $2, upgrade_block_id = $3, speed = $4, point = $5, native_price = $6, ton_price = $7, level = $8, is_active = $9 WHERE id = $1`,
      [id, userId, upgradeBlockId, speed, point, nativePrice, tonPrice, level, isActive]
    );
  }

  async deleteUsersUpgradeBlockById(
    id: UUID,
    client?: PoolClient | Pool
  ): Promise<void> {
    const queryClient = client ?? this.pool;

    await queryClient.query(
      'DELETE FROM users_upgrade_blocks WHERE id = $1',
      [id]
    );
  }



  // START users_boost_blocks

  async getUserBoostBlocks(
    userId: UUID,
    client?: PoolClient | Pool,
  ): Promise<UserBoostBlock[]> {
    const queryClient = client ?? this.pool;
    
    const result = await queryClient.query(
      `SELECT * FROM users_boost_blocks WHERE user_id = $1`,
      [userId]
    );

    return result.rows.length > 0 ? result.rows : [];
  }

  async getActiveUserBoostBlocks(
    client?: PoolClient | Pool,
  ): Promise<BoostBlock[]> {
    const queryClient = client ?? this.pool;
    
    const result = await queryClient.query(
      `SELECT * FROM users_boost_blocks WHERE is_active = $1`,
      [true]
    );

    return result.rows.length > 0 ? result.rows : [];
  }

  async updateUserBoostBlockById(
    id: UUID,
    userId: UUID,
    boostBlockId: UUID,
    speed: number,
    duration: number,
    tonPrice: number,
    level: number,
    isActive: boolean,
    client?: PoolClient | Pool,
  ): Promise<void> {
    const queryClient = client ?? this.pool;
    
    await queryClient.query(
      `UPDATE users_boost_blocks SET user_id = $2, boost_block_id = $3, speed = $4, duration = $5, native_price = $3, ton_price = $4, level = $5, is_active = $6 WHERE id = $7`,
      [id, userId, boostBlockId, speed, duration, tonPrice, level, isActive, id]
    );
  }

  async deleteUserBoostBlockById(
    id: UUID,
    client?: PoolClient | Pool
  ): Promise<void> {
    const queryClient = client ?? this.pool;

    await queryClient.query(
      'DELETE FROM users_boost_blocks WHERE id = $1',
      [id]
    );
  }

}
