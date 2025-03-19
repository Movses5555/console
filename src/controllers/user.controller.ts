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
   *               type: object
   *               properties:
   *                 is_used_daily_code:
   *                   type: boolean
   *                   example: true
   *                 is_used_daily_claim:
   *                   type: boolean
   *                   example: true
   *                 total_balance:
   *                   type: integer
   *                   example: 2300
   *                 daily_claim_point:
   *                   type: integer
   *                   example: 100
   *                 user_mining_data:
   *                   type: object
   *                   properties:
   *                     boostSpeed:
   *                       type: integer
   *                       example: 1
   *                     upgradeSpeed:
   *                       type: integer
   *                       example: 1
   *                     blockPoint:
   *                       type: integer
   *                       example: 75
   *                     miningLeftSecond:
   *                       type: integer
   *                       example: 11265711
   *                     miningPoints:
   *                       type: integer
   *                       example: 365
   *                 booster:
   *                   type: object
   *                   properties:
   *                     upgrades:
   *                       type: array
   *                       items:
   *                         type: object
   *                         properties:
   *                           id:
   *                             type: string
   *                             example: "2c45c457-42ea-4c71-91c7-e49de0a66ba4"
   *                           speed:
   *                             type: integer
   *                             example: 1
   *                           point:
   *                             type: integer
   *                             example: 75
   *                           native_price:
   *                             type: string
   *                             example: "0"
   *                           ton_price:
   *                             type: string
   *                             example: "0"
   *                           level:
   *                             type: string
   *                             example: "1"
   *                           is_active:
   *                             type: boolean
   *                             example: true
   *                           created_at:
   *                             type: string
   *                             format: date-time
   *                             example: "2025-03-18T08:43:20.242Z"
   *                           updated_at:
   *                             type: string
   *                             format: date-time
   *                             example: "2025-03-18T08:43:20.242Z"
   *                     boosts:
   *                       type: array
   *                       items:
   *                         type: object
   *                         properties:
   *                           id:
   *                             type: string
   *                             example: "265adfaf-1a9f-40c6-8ec9-81d0af282e7a"
   *                           speed:
   *                             type: integer
   *                             example: 1
   *                           duration:
   *                             type: integer
   *                             example: 30
   *                           ton_price:
   *                             type: string
   *                             example: "0"
   *                           is_free:
   *                             type: boolean
   *                             example: true
   *                           is_active:
   *                             type: boolean
   *                             example: true
   *                           created_at:
   *                             type: string
   *                             format: date-time
   *                             example: "2025-03-19T03:29:21.918Z"
   *                           updated_at:
   *                             type: string
   *                             format: date-time
   *                             example: "2025-03-19T03:29:21.918Z"
   *                     bot:
   *                       type: object
   *                       additionalProperties: true
   *                       description: Empty object (bot data)
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
    const user = await this.userService.getUserById(userId);
    if (user) {
      const userData = await this.userService.getUserDataById(userId);
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
   *         description: Daily code is valid, returning daily points and total balance.
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 totalBalance:
   *                   type: integer
   *                   description: The user's total balance after receiving daily points.
   *                 dailyCodePoint:
   *                   type: integer
   *                   description: Number of points awarded for the correct daily code.
   *       400:
   *         description: Incorrect daily code or daily code already used.
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 msg:
   *                   type: string
   *                   example: Daily code has already been used
   *       404:
   *         description: User not found.
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 msg:
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
    const result = await this.userService.checkDailyCode(userId, code);
    res.json(result);
  }

  /**
   * @swagger
   * /users/daily-claim:
   *   put:
   *     summary: Claim daily reward
   *     description: Allows a user to claim their daily reward points.
   *     security:
   *       - BearerAuth: []
   *     responses:
   *       200:
   *         description: Daily claim successful, returning updated total balance and daily claim points.
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 totalBalance:
   *                   type: integer
   *                   description: The user's total balance after claiming daily points.
   *                 dailyClaimPoint:
   *                   type: integer
   *                   description: Number of points awarded for the daily claim.
   *       400:
   *         description: Daily claim has already been used.
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 msg:
   *                   type: string
   *                   example: Daily claim has already been used
   *       404:
   *         description: User not found.
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 msg:
   *                   type: string
   *                   example: User not found
   *       500:
   *         description: Internal server error.
   */
  @httpPut('/daily-claim', authMiddleware as unknown as Middleware)
  public async dailyClaim(
    @request() req: RequestWithAuth, 
    @response() res: Response
  ) {
    const { userId } = req.payload;
    const result = await this.userService.dailyClaim(userId);
    res.json(result);
  }
}