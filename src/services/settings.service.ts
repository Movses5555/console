import { inject, injectable } from 'inversify';
import { TYPES } from '../di/types';
import ISettingsService from './interfaces/ISettingsService';
import { IRepository } from '../repositories/interfaces/IRepository';

@injectable()
export default class SettingsService implements ISettingsService {
  constructor(
      @inject(TYPES.Repository) private repository: IRepository,
  ) {}

  async getSettingsValueByKey(key: string): Promise<number> {
    return this.repository.getSettingsValueByKey(key);
  }

}
