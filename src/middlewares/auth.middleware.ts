import { NextFunction, Request, Response, RequestHandler } from 'express';
import IAuthService from '../services/interfaces/IAuthService';
import UnauthorizedError from '../errors/unauthorized.error';
import { RequestWithAuth } from '../requests/auth/auth-base.request';
import { TYPES } from '../di/types';

const authMiddleware: RequestHandler = (
  req: Request, 
  _res: Response, 
  next: NextFunction) => {  
  const customReq = req as RequestWithAuth;
  const authService = customReq.container.get<IAuthService>(TYPES.AuthService);
  const headerValue = customReq.header('Authorization');

  if (!headerValue?.includes('Bearer')) throw new UnauthorizedError();

  const token = headerValue.replace('Bearer ', '').trim();

  if (!token) throw new UnauthorizedError();

  try {
    const payload = authService.getPayloadFromToken(token);
    if (!payload) throw new UnauthorizedError();

    if (Number.isInteger(payload.userId)) {
      throw new UnauthorizedError();
    }
    
    customReq.payload = payload;

  } catch {
    throw new UnauthorizedError();
  }

  next();
};

export default authMiddleware;
