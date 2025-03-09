import { inject, injectable } from 'inversify';
import pg, { Pool, PoolClient, types } from 'pg';
import { DateTime, Duration } from 'luxon';
import { randomUUID, UUID } from 'crypto';

import BaseRepository from './base-repository';
import { IRepository } from './interfaces/IRepository';
import pool from '../config/db';
import TelegramUser from '../models/telegram-user';
import { Mining } from '../models/mining.model';



@injectable()
export default class Repository
  extends BaseRepository
  implements IRepository
{
  private pool: Pool;

  constructor(pool: Pool) {
    types.setTypeParser(types.builtins.TIMESTAMPTZ, (stringValue) =>
      DateTime.fromSQL(stringValue, { zone: 'utc' }),
    );
    super();
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
    return result.rows[0];
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
      'UPDATE balances SET total_balance = $1 WHERE user_id = $3',
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
  
  async isDailyCodeUsed(
    userId: UUID,
    client?: PoolClient | Pool,
  ): Promise<boolean> {
    const queryClient = client ?? this.pool;

    const result = await queryClient.query(
      'SELECT is_used_daily_code FROM users WHERE id = $1',
      [userId],
    );

    console.log('isDailyCodeUsed result====', result.rows);
    
    return result.rows[0]?.is_used_daily_code;
  }

  async updateIsDailyCodeUsed(
    userId: UUID,
    isDailyCodeUsed: boolean,
    client?: PoolClient | Pool,  
  ): Promise<string> {
    const queryClient = client ?? this.pool;

    const result = await queryClient.query(
      'UPDATE users SET is_used_daily_code = $1 WHERE user_id = $2',
      [isDailyCodeUsed, userId],
    );

    console.log('updateIsDailyCodeUsed result====', result.rows);
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

    await queryClient.query(`TRUNCATE daily_code RESTART IDENTITY`);
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
  
}
