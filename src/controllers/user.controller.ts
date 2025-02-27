import { Request, Response } from 'express';
import { inject, injectable } from 'inversify';
import { TYPES } from '../di/types';
import UserService  from '../services/user.service';

@injectable()
export class UserController {
  constructor(
    @inject(TYPES.UserService) private userService: UserService
  ) {}

  async getUsers(req: Request, res: Response) {
    const users = await this.userService.getUsers();
    res.json(users);
  }

  async createUser(req: Request, res: Response) {
    const { name, email } = req.body;
    const user = await this.userService.createUser(name, email);
    res.status(201).json(user);
  }
}