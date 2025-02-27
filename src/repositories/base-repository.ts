import { Pool } from 'pg';

export class BaseRepository {
  protected pool: Pool;

  constructor(pool: Pool) {
    this.pool = pool;
  }

  async query(text: string, params?: any[]) {
    return this.pool.query(text, params);
  }
}
