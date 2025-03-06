import AuthCredentials from '../../models/auth-credentials';
import User from '../../models/user';
import TelegramUser from '../../models/telegram-user';
import AccessTokenPayload from '../../models/access-token-payload';

export default interface IAuthService {
  telegramAuth(data: TelegramUser): Promise<AuthCredentials>;

  validateTelegramAuthData(data: TelegramUser): boolean;

  getAuthCredentials(user: User, oldRefreshToken?: string): Promise<AuthCredentials>;

  getPayloadFromToken(token: string): AccessTokenPayload | undefined;
}
