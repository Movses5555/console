import { inject, injectable } from 'inversify';
import { TYPES } from '../di/types';
import { UUID } from 'crypto';
import IUserService from './interfaces/IUserService';
import DomainError from '../errors/domain.error';
import { IRepository } from '../repositories/interfaces/IRepository';

@injectable()
export default class UserService implements IUserService {
  constructor(
    @inject(TYPES.Repository) private repository: IRepository,
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
    const userTotalPoints = await this.repository.getTotalBalanceByUserId(userId);
    const userMiningData = await this.repository.getMiningByUserId(userId);
    // const dailyClaimPoint = await this.repository.getMiningByUserId(userId);

    return user;
  }

  async getTotalBalanceByUserId(id: UUID) {
    return this.repository.getTotalBalanceByUserId(id);
  }


  async checkDailyCode(
    userId: UUID,
    code: string
  ): Promise<{ totalBalance: number; dailyPoint: number }> {
    console.log('ssssssssssssssssssss');
    
    const user = await this.getUserById(userId);
    console.log('user', user);
    if (!user) {
      throw new DomainError('User not found');
    }
    const activeCode = await this.repository.getDailyCode();
    console.log('activeCode', activeCode);
    if(code !== activeCode) {
      throw new DomainError('Incorrect daily code');
    }

    const isDailyCodeUsed = await this.repository.isDailyCodeUsed(userId);
    console.log('isDailyCodeUsed', isDailyCodeUsed);
    if(isDailyCodeUsed) {
      throw new DomainError('Daily code has already been used');
    }
    console.log('aaaaaaaaaaaaaaa');
    
    const client = await this.repository.createClientAndBeginTransaction();
    console.log('client', client);
    try {
      await this.repository.updateIsDailyCodeUsed(userId, true);
      const dailyPoint = await this.repository.getSettingsValueByKey('daily_point');
      console.log('dailyPoint', dailyPoint);
      const balance = await this.repository.getTotalBalanceByUserId(userId);
      console.log('balance', balance);
      const totalBalance = balance + dailyPoint;
      console.log('balance', balance);
      await this.repository.updateUserBalances(userId, totalBalance);

      await this.repository.commitAndRelease(client);

      return {
        totalBalance,
        dailyPoint: dailyPoint,
      }
    } catch (e) {
      await this.repository.rollbackAndRelease(client);
      throw e;
    }
  }

  async isActiveDailyCode(code: string): Promise<boolean> {
    const activeCode = await this.repository.getDailyCode();
    console.log('activeCode', activeCode);
    
    return code === activeCode;
  }


  async getDailyCodePoint(): Promise<number> {
    const dailyPoint = await this.repository.getSettingsValueByKey('daily_point');
    console.log('dailyPoint', dailyPoint);
    
    return dailyPoint;
  }
}
