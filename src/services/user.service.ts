import { inject, injectable } from 'inversify';
import { TYPES } from '../di/types';
import { UUID } from 'crypto';
import IUserService from './interfaces/IUserService';
import DomainError from '../errors/domain.error';
import { IRepository } from '../repositories/interfaces/IRepository';

import UpgradeBlock from '../models/upgrade-block.model';
import UserUpgradeBlock from '../models/user-upgrade-block.model';
import BoostBlock from '../models/boost-block.model';
import UserBoostBlock from '../models/user-boost-block.model';
import IMiningService from './interfaces/IMiningService';


@injectable()
export default class UserService implements IUserService {
  constructor(
    @inject(TYPES.Repository) private repository: IRepository,
    @inject(TYPES.MiningService) private miningService: IMiningService,
  ) {}

  async createUser(name: string, email: string) {
    const user = await this.repository.createUser(name, email);
    
    await this.repository.createUserBalances(user.id);
    return user;
  }

  async getUserById(id: UUID) {
    return this.repository.getUserById(id);
  }

  async getUserDataById(userId: UUID) {
    const user = await this.repository.getUserById(userId);
    if (!user) {
      throw new DomainError('Данные Telegram не валидированы.');
    }
    try {
      const [
        totalBalance,
        dailyClaimPoint,
        miningBlockPoint,
        blockClaimDurationMS,
        userMiningSession,
        upgrades,
        userUpgrades,
        boosts,
        userBoosts,
      ] = await Promise.all([
        this.repository.getTotalBalanceByUserId(userId),
        this.repository.getSettingsValueByKey('daily_point'),
        this.repository.getSettingsValueByKey('block_point'),
        this.repository.getSettingsValueByKey('blocks_claim_duration_ms'),
        this.repository.getMiningByUserId(userId),
        this.repository.getActiveUpgradeBlocks(),
        this.repository.getUserUpgradeBlocks(userId),
        this.repository.getActiveBoostBlocks(),
        this.repository.getUserBoostBlocks(userId),
      ]);

      let userMiningData = {};
      if (userMiningSession) {
        userMiningData = this.miningService.getMiningSession(
          userMiningSession.last_claimed_at,
          userMiningSession.upgrade_speed,
          userMiningSession.boost_speed,
          miningBlockPoint,
          blockClaimDurationMS,
        )
      }
      const mappingUpgradesData = this.mappingUpgradesData(upgrades, userUpgrades);
      const mappingBoostData = this.mappingBoostData(boosts, userBoosts);
      
      return {
        is_used_daily_code: user.is_used_daily_code,
        is_used_daily_claim: user.is_used_daily_claim,
        total_balance: totalBalance,
        daily_claim_point: dailyClaimPoint,
        user_mining_data: userMiningData,
        booster: {
          upgrades: mappingUpgradesData,
          boosts: mappingBoostData,
          bot: {}
        },
      };
    } catch (error) {
      throw new DomainError('Something went wrong.');
    }
    
  }

  async getTotalBalanceByUserId(id: UUID) {
    return this.repository.getTotalBalanceByUserId(id);
  }

  async checkDailyCode(
    userId: UUID,
    code: string
  ): Promise<{
    totalBalance: number;
    dailyCodePoint: number
  }> {  
    const user = await this.getUserById(userId);
    if (!user) {
      throw new DomainError('User not found');
    }
  
    const activeCode = await this.repository.getDailyCode();
    if (code !== activeCode) {
      throw new DomainError('Incorrect daily code');
    }
  
    const isUsedDailyCode = await this.repository.isUsedDailyCode(userId);
    if (isUsedDailyCode) {
      throw new DomainError('Daily code has already been used');
    }
  
    const client = await this.repository.createClientAndBeginTransaction();
  
    try {
      const [
        dailyCodePoint,
        balance,
        _,
      ] = await Promise.all([
        this.repository.getSettingsValueByKey('code_point', client),
        this.repository.getTotalBalanceByUserId(userId, client),
        this.repository.updateIsUsedDailyCode(userId, true, client),
      ]);
      const totalBalance = balance + dailyCodePoint;
      await this.repository.updateUserBalances(userId, totalBalance, client);

      await this.repository.commitAndRelease(client);
  
      return {
        totalBalance,
        dailyCodePoint: dailyCodePoint,
      };
    } catch (e) {
      await this.repository.rollbackAndRelease(client);
      throw e;
    }
  }

  async isActiveDailyCode(code: string): Promise<boolean> {
    const activeCode = await this.repository.getDailyCode();
    return code === activeCode;
  }
  
  
  async getDailyCodePoint(): Promise<number> {
    const dailyPoint = await this.repository.getSettingsValueByKey('daily_point');
    
    return dailyPoint;
  }
  
  async dailyClaim(
    userId: UUID
  ): Promise<{
    totalBalance: number;
    dailyClaimPoint: number;
  }> {
    const user = await this.getUserById(userId);
    if (!user) {
      throw new DomainError('User not found');
    }
  
    const isUsedDailyClaim = await this.repository.isUsedDailyClaim(userId);
    if (isUsedDailyClaim) {
      throw new DomainError('Daily claim has already been used');
    }


    const client = await this.repository.createClientAndBeginTransaction();
  
    try {
      const [
        dailyClaimPoint,
        balance,
        _,
      ] = await Promise.all([
        this.repository.getSettingsValueByKey('daily_point', client),
        this.repository.getTotalBalanceByUserId(userId, client),
        this.repository.updateIsUsedDailyClaim(userId, true, client),
      ]);
      const totalBalance = balance + dailyClaimPoint;
      await this.repository.updateUserBalances(userId, totalBalance, client);
      
      await this.repository.commitAndRelease(client);
  
      return {
        totalBalance,
        dailyClaimPoint: dailyClaimPoint,
      };
    } catch (e) {
      await this.repository.rollbackAndRelease(client);
      throw e;
    }
  }

  
  mappingUpgradesData(upgrades: UpgradeBlock[] , userUpgrades: UserUpgradeBlock[]): UpgradeBlock[] {

    const mapped = upgrades.map((upgrade) => ({
      ...upgrade,
      is_active: userUpgrades.some((u) => u.upgrade_block_id === upgrade.id),
    }));
    
    return mapped;
  }

  mappingBoostData(boosts: BoostBlock[], userBoost: UserBoostBlock[]): BoostBlock[] {
    const mapped = boosts.map((boost) => ({
      ...boost,
      is_active: userBoost.some((b) => b.boost_block_id === boost.id),
    }));
    
    return mapped;
  }
}
