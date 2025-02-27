import { injectable } from 'inversify';
import { BaseRepository } from './base-repository';
import pool from '../db/db';

@injectable()
export class UserRepository extends BaseRepository {
  constructor() {
    super(pool);
  }

  async getUsers() {
    const result = await this.query('SELECT * FROM users');
    return result.rows;
  }

  async createUser(name: string, email: string) {
    const result = await this.query(
      'INSERT INTO users (name, email) VALUES ($1, $2) RETURNING *',
      [name, email]
    );
    return result.rows[0];
  }
}
