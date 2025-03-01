import { Request, Response } from 'express';
import { inject } from 'inversify';
import {
  controller,
  httpGet,
  httpPost,
  request,
  response,
} from 'inversify-express-utils';
import { TYPES } from '../di/types';
import { UserService } from '../services/user.service';

@controller('/users')
export class UserController {
  constructor(
    @inject(TYPES.UserService) private userService: UserService
  ) {}

  /**
   * @swagger
   * /users:
   *   get:
   *     summary: Get all users
   *     description: Returns a list of all users.
   *     responses:
   *       200:
   *         description: A list of users.
   *         content:
   *           application/json:
   *             schema:
   *               type: array
   *               items:
   *                 $ref: '#/components/schemas/User'
   */
  @httpGet('/')
  public async getUsers(@request() req: Request, @response() res: Response) {
    const users = await this.userService.getUsers();
    res.json(users);
  }

  /**
   * @swagger
   * /users:
   *   post:
   *     summary: Create a new user
   *     description: Creates a new user with the provided name and email.
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - name
   *               - email
   *             properties:
   *               name:
   *                 type: string
   *                 example: John Doe
   *               email:
   *                 type: string
   *                 example: john.doe@example.com
   *     responses:
   *       201:
   *         description: User created successfully.
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/User'
   *       400:
   *         description: Invalid input. Name and email are required.
   *       500:
   *         description: Internal server error.
   */
  @httpPost('/')
  public async createUser(@request() req: Request, @response() res: Response) {
    const { name, email } = req.body;
    console.log('name', name);
    console.log('email', email);
    
    const user = await this.userService.createUser(name, email);
    console.log('user', user);
    
    res.status(201).json(user);
  }

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
  @httpGet('/:id')
  public async getUserById(@request() req: Request, @response() res: Response) {
    const id = parseInt(req.params.id, 10);
    const user = await this.userService.getUserById(id);
    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  }
}