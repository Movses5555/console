import { Request, Response } from 'express';
import { inject } from 'inversify';
import {
  controller,
  httpGet,
  httpPut,
  request,
  response,
  Middleware,
} from 'inversify-express-utils';
import { TYPES } from '../di/types';
import UserService from '../services/user.service';
import SettingsService from '../services/settings.service';
import { RequestWithAuth } from '../requests/auth/auth-base.request';
import authMiddleware from '../middlewares/auth.middleware';

@controller('/user')
export class UserController {
  constructor(
    @inject(TYPES.UserService) private userService: UserService,
    @inject(TYPES.SettingsService) private settingsService: SettingsService,
  ) {}

  /**
   * @swagger
   * /users/{id}:
   *   get:
   *     summary: Get a user by ID
   *     description: Returns a user by their ID.
   *     security:
   *       - BearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: The ID of the user to retrieve.
   *     responses:
   *       200:
   *         description: A user object.
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/User'
   *       400:
   *         description: Invalid user ID format.
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 message:
   *                   type: string
   *                   example: Invalid user ID
   *       404:
   *         description: User not found.
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 message:
   *                   type: string
   *                   example: User not found
   *       500:
   *         description: Internal server error.
   */
  @httpGet('/', authMiddleware as unknown as Middleware)
  public async getUserById(
    @request() req: RequestWithAuth, 
    @response() res: Response
  ) {
    const { userId } = req.payload;
    
    const id = parseInt(req.params.id, 10);
    console.log('id', id, req.params.id);
    
    const user = await this.userService.getUserById(userId);
    console.log('user', user);
    if (user) {
      const userData = await this.userService.getUserDataById(userId);
      console.log('user', userData);
      res.json(userData);
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  }

  /**
   * @swagger
   * /users/daily-code:
   *   put:
   *     summary: Check daily code validity
   *     description: Validates a daily code and returns the daily points if the code is correct.
   *     security:
   *       - BearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - code
   *             properties:
   *               code:
   *                 type: string
   *                 description: The daily code to validate.
   *     responses:
   *       200:
   *         description: Daily code is valid, returning daily points.
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 dailyPoint:
   *                   type: string
   *                   description: Number of points awarded for the correct daily code.
   *       400:
   *         description: Incorrect daily code.
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 message:
   *                   type: string
   *                   example: Incorrect daily code
   *       404:
   *         description: User not found.
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 message:
   *                   type: string
   *                   example: User not found
   *       500:
   *         description: Internal server error.
   */
  @httpPut('/daily-code', authMiddleware as unknown as Middleware)
  public async checkDailyCode(
    @request() req: RequestWithAuth, 
    @response() res: Response
  ) {
    const { userId } = req.payload;
    const { code } = req.body;
    console.log('userId', userId);
    console.log('code', code);

    const result = await this.userService.checkDailyCode(userId, code);
    console.log('result', result);
    
    res.json(result);
  }

  @httpPut('/daily-claim', authMiddleware as unknown as Middleware)
  public async dailyClaim(
    @request() req: RequestWithAuth, 
    @response() res: Response
  ) {
    // const { userId } = req.payload;
    // const user = await this.userService.getUserById(userId);
    // if (user) {
    //   const isActiveDailyCode = await this.userService.isActiveDailyCode(code);
    //   if(!isActiveDailyCode) {
    //     return res.status(400).json({ message: 'Incorrect daily code' });
    //   }
    //   const dailyPoint = await this.settingsService.getSettingsValueByKey('daily_point');
    //   res.json({dailyPoint});
    // } else {
    //   res.status(404).json({ message: 'User not found' });
    // }
  }
}