import { injectable } from 'inversify';
import { BaseRepository } from './base-repository';
import pool from '../config/db';
import { IAuthRepository } from './interfaces/IAuthRepository';

@injectable()
export class AuthRepository extends BaseRepository implements IAuthRepository {
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
}
