import { UUID } from 'crypto';
import { Pool, PoolClient } from 'pg';
import { Mining } from '../../models/mining.model';

export default interface IMiningService {
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
  
}

