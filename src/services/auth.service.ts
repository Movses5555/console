import { inject, injectable } from 'inversify';
import jwt, { JwtPayload } from 'jsonwebtoken';
import crypto, { randomUUID, UUID } from 'crypto';
import { TYPES } from '../di/types';
import IAuthService from './interfaces/IAuthService';
import { IUserRepository } from '../repositories/interfaces/IUserRepository';
import User from '../models/user';
import DomainError from '../errors/domain.error';
import AuthCredentials from '../models/auth-credentials';
import AccessTokenPayload from '../models/access-token-payload';
import TelegramUser from '../models/telegram-user';

@injectable()
export default class AuthService implements IAuthService {
  constructor(
    @inject(TYPES.UserRepository) private userRepository: IUserRepository
  ) {}

  private readonly JWT_VERIFICATION_TOKEN = process.env.JWT_VERIFICATION_TOKEN!;


  async getAuthCredentials(user: User, oldRefreshToken?: string) {
    const payload = new AccessTokenPayload(user.id);
    const plainPayload = { userId: payload.userId };
    const accessToken = jwt.sign(plainPayload, this.JWT_VERIFICATION_TOKEN, {
      expiresIn: '30m',
    });

    let refreshToken: string = oldRefreshToken || '';

    if (!refreshToken) {
      refreshToken = jwt.sign(plainPayload, this.JWT_VERIFICATION_TOKEN, {
        expiresIn: '7d',
      });
    }
    return new AuthCredentials(accessToken, refreshToken);
  }


  validateTelegramAuthData(data: TelegramUser): boolean {
    const { hash, ...rest } = data;
    const restEntries: { [key: string]: string | number } = rest;

    const secretKey = crypto
      .createHash('sha256')
      .update(process.env.TELEGRAM_BOT_TOKEN!)
      .digest();
    console.log('secretKey', secretKey);
    
    const checkString = Object.keys(restEntries)
      .sort()
      .map((key) => `${key}=${restEntries[key]}`)
      .join('\n');
    console.log('checkString', checkString);
    const hmac = crypto
      .createHmac('sha256', secretKey)
      .update(checkString)
      .digest('hex');
    console.log('hmac', hmac);

    return hmac === hash;
  }

  async telegramAuth(data: TelegramUser) {
    
    if (!this.validateTelegramAuthData(data)) {
      throw new DomainError('Данные Telegram не валидированы.');
    }
    console.log('aaaaaaaaaaa', data);
    
    let user = await this.userRepository.getUserByTelegramId(data.id);
    console.log('user', user);
    
    if (!user) {
      await this.userRepository.createTelegramUser(data);
      console.log('aaaaaaaaaaaaaaaddddddddddddddddddddd');
      
      user = await this.userRepository.getUserByTelegramId(data.id);
      if (!user) {
        throw new DomainError(
          'Мы не смогли создать нового пользователя через этот Телеграмма.',
        );
      }
    }
    return this.getAuthCredentials(user);
  }

  getPayloadFromToken(token: string): AccessTokenPayload | undefined {
    try {
      if (!jwt.verify(token, this.JWT_VERIFICATION_TOKEN)) return undefined;
    } catch {
      return undefined;
    }
    console.log('=================', token);
    
    const decoded = JSON.parse(JSON.stringify(jwt.decode(token)));
    return new AccessTokenPayload(decoded.userId);
  }
}
