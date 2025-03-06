import { injectable } from 'inversify';
import { BaseRepository } from './base-repository';
import pool from '../config/db';
import { IUserRepository } from './interfaces/IUserRepository';
import TelegramUser from '../models/telegram-user';
import { randomUUID, UUID } from 'crypto';


@injectable()
export class UserRepository extends BaseRepository implements IUserRepository {
  constructor() {
    super(pool);
  }

  async getUsers() {
    console.log('cccccccccccccc');
    
    console.log('this.query', this.query);
    console.log('this.pool', this.pool);
    
    const result = await this.pool.query('SELECT * FROM users');
    console.log('result====', result);
    
    return result.rows;
  }

  async getUserById(id: number) {
    const result = await this.query('SELECT * FROM users WHERE id = $1', [id]);
    return result.rows[0];
  }

  async createUser(name: string, email: string) {
    const result = await this.query(
      'INSERT INTO users (name, email) VALUES ($1, $2) RETURNING *',
      [name, email]
    );
    return result.rows[0];
  }

  async updateUser(id: number, name: string, email: string) {
    const result = await this.query(
      'UPDATE users SET name = $1, email = $2 WHERE id = $3 RETURNING *',
      [name, email, id]
    );
    return result.rows[0];
  }

  async deleteUser(id: number) {
    await this.query('DELETE FROM users WHERE id = $1', [id]);
  }

  async createTelegramUser(user: TelegramUser): Promise<void> {
    const { id, username, photo_url} = user;
    console.log('id, username, photo_url', id, username, photo_url);
    try {
      await this.pool.query(
        'INSERT INTO users(id, telegram_id, username, photo_url) VALUES($1, $2, $3, $4)',
        [randomUUID(), id, username, photo_url],
      );
    } catch (error) {
      console.log('error', error);
      
    }

  }

  async getUserByTelegramId(id: number) {
    const result = await this.query('SELECT * FROM users WHERE telegram_id = $1', [id]);
    return result.rows[0];
  }
}
