import { Request, Response } from 'express';
import { inject } from 'inversify';
import {
  controller,
  httpPost,
  request,
  response,
} from 'inversify-express-utils';
import { TYPES } from '../di/types';
import IAuthService from '../services/interfaces/IAuthService';

@controller('/auth')
export class AuthController {
  @inject(TYPES.AuthService) authService!: IAuthService;
  
  /**
 * @swagger
 * /auth/telegram:
 *   post:
 *     summary: Authenticate via Telegram
 *     description: Authenticates a user using Telegram WebApp data and returns a JWT token.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               auth_date:
 *                 type: integer
 *                 example: 1733282584
 *               first_name:
 *                 type: string
 *                 example: "Poghos"
 *               last_name:
 *                 type: string
 *                 example: "Poghosyan"
 *               hash:
 *                 type: string
 *                 example: "5a8d270dc0vjd26ebdbe32de91e75c919061b93bef51726e6077938f766d5143"
 *               id:
 *                 type: integer
 *                 example: 1802368420
 *               photo_url:
 *                 type: string
 *                 format: uri
 *                 example: "https://t.me/i/userpic/320/R6kP81fplPdhuT-LUfFQPEUXqqKPrvaTLmqSgpUeMfc.jpg"
 *               username:
 *                 type: string
 *                 example: "Poghos_kkk"
 *     responses:
 *       200:
 *         description: Successfully authenticated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 accessToken:
 *                   type: string
 *                   example: "your_access_token_here"
 *                 refreshToken:
 *                   type: string
 *                   example: "your_refresh_token_here"
 *       400:
 *         description: Invalid or missing authentication data
 *       401:
 *         description: Unauthorized (invalid credentials)
 */
  @httpPost('/telegram')
  private async telegramLogin(
    @request() req: Request,
    @response() res: Response,
  ) {
    const data = req.body;
    const authCredentials = await this.authService.telegramAuth(data);
    res.json(authCredentials);
  }
}