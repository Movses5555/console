import { inject, injectable } from 'inversify';
import { TYPES } from '../di/types';
import { UUID } from 'crypto';
import { Mining } from '../models/mining.model';
import IMiningService from './interfaces/IMiningService';
import { IRepository } from '../repositories/interfaces/IRepository';

@injectable()
export default class MiningService implements IMiningService {
  constructor(
    @inject(TYPES.Repository) private repository: IRepository,
  ) {}

  async createMining(
    userId: UUID,
    multiplier: number,
    lastClaimedAt: Date,
  ): Promise<void> {
    const mining = await this.repository.createMining(
      userId, multiplier, lastClaimedAt
    );
    return mining;
  }

  async getMiningByUserId(userId: UUID): Promise<Mining | null> {
    return this.repository.getMiningByUserId(userId);
  }

  async updateMiningMultiplier(userId: UUID, multiplier: number): Promise<void> {
    return this.repository.updateMiningMultiplier(userId, multiplier);
  }

  async updateMiningLastClaimedAt(userId: UUID, lastClaimedAt: Date): Promise<void> {
    return this.repository.updateMiningLastClaimedAt(userId, lastClaimedAt);
  }

  async deleteSession(userId: UUID): Promise<void> {
    return this.repository.deleteSession(userId);
  }

}
