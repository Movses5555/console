import { injectable, inject } from 'inversify';
import IUserService from './interfaces/IUserService';
import { TYPES } from '../di/types';
import { UserRepository } from '../repositories/user-repository';

@injectable()
export default class UserService implements IUserService {
  constructor(
    @inject(TYPES.UserRepository) private userRepository: UserRepository
  ) {}

  async getUsers() {
    return this.userRepository.getUsers();
  }

  async createUser(name: string, email: string) {
    return this.userRepository.createUser(name, email);
  }


}
