import { Request, Response } from 'express';
import { inject } from 'inversify';
import {
  controller,
  httpGet,
  request,
  response,
  Middleware,
} from 'inversify-express-utils';
import { TYPES } from '../di/types';
import UserService from '../services/user.service';
import { RequestWithAuth } from '../requests/auth/auth-base.request';
import authMiddleware from '../middlewares/auth.middleware';

@controller('/user')
export class UserController {
  constructor(
    @inject(TYPES.UserService) private userService: UserService
  ) {}

  /**
   * @swagger
   * /users/{id}:
   *   get:
   *     summary: Get a user by ID
   *     description: Returns a user by their ID.
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: integer
   *         description: The ID of the user to retrieve.
   *     responses:
   *       200:
   *         description: A user object.
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/User'
   *       404:
   *         description: User not found.
   *       500:
   *         description: Internal server error.
   */
  @httpGet('/', authMiddleware as unknown as Middleware)
  public async getUserById(
    @request() req: RequestWithAuth, 
    @response() res: Response
  ) {
    console.log(req.params);
    
    const id = parseInt(req.params.id, 10);
    console.log('id', id, req.params.id);
    
    const user = await this.userService.getUserById(id);
    console.log('user', user);
    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  }
}