import { inject, injectable } from 'inversify';
import { TYPES } from '../di/types';
import { UUID } from 'crypto';
import Mining from '../models/mining.model';
import IMiningService from './interfaces/IMiningService';
import { IRepository } from '../repositories/interfaces/IRepository';
import { DateTime } from 'luxon';

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

  getMiningSession(
    lastClaimedAt: DateTime,
    upgradeSpeed: number,
    boostSpeed: number,
    miningBlockPoint: number,
    durationMS: number
  ): {
    boostSpeed: number,
    upgradeSpeed: number,
    blockPoint: number,
    miningLeftSecond: number,
    miningPoints: number,
  } {
    const {remainingTime, pastTime} = this.getLeftDate(lastClaimedAt, durationMS);
    const blockPoint = miningBlockPoint * upgradeSpeed;
    const miningPoints = this.calculateMiningPoints(blockPoint, pastTime);
    const data = {
      boostSpeed,
      upgradeSpeed,
      blockPoint,
      miningLeftSecond: remainingTime,
      miningPoints,
    };
    
    return data;
  }

  calculateMiningPoints(blockPoint:number, pastTime: number): number {
    const hoursPassed = pastTime / (1000 * 60 * 60);
    const points = blockPoint * hoursPassed;
    return Math.floor(points);
  }

  
  getLeftDate(
    lastClaimedAt: DateTime,
    durationMs: number
  ): {
    remainingTime: number,
    pastTime: number
  } {
    const lastClaimedTime = lastClaimedAt instanceof DateTime ? lastClaimedAt.toJSDate().getTime() : new Date(lastClaimedAt).getTime();
    const currentTime = Date.now();
    const remainingTime = (lastClaimedTime + durationMs) - currentTime;
    const pastTime = currentTime - lastClaimedTime;
    return {
      remainingTime: Math.max(remainingTime, 0),
      pastTime: Math.max(pastTime, 0),
    }
  }
}
