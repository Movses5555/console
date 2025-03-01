import { inject, injectable } from 'inversify';
import { TYPES } from '../di/types';
import { UserRepository } from '../repositories/user-repository';

@injectable()
export class UserService {
  constructor(
    @inject(TYPES.UserRepository) private userRepository: UserRepository
  ) {}

  async getUsers() {
    return this.userRepository.getUsers();
  }

  async createUser(name: string, email: string) {
    return this.userRepository.createUser(name, email);
  }

  async getUserById(id: number) {
    return this.userRepository.getUserById(id);
  }
}
