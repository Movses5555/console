import { NextFunction, Request, Response, RequestHandler } from 'express';
import IAuthService from '../services/interfaces/IAuthService';
import UnauthorizedError from '../errors/unauthorized.error';
import { RequestWithAuth } from '../requests/auth/auth-base.request';
import { TYPES } from '../di/types';

const authMiddleware: RequestHandler = (
  req:RequestWithAuth, 
  _res: Response, 
  next: NextFunction) => {  
  // const customReq = req as RequestWithAuth;
  const authService = req.container.get<IAuthService>(TYPES.AuthService);
  const headerValue = req.header('Authorization');
  console.log('headerValue', headerValue);

  if (!headerValue?.includes('Bearer')) throw new UnauthorizedError();

  const token = headerValue.replace('Bearer ', '').trim();

  console.log('token', token);
  if (!token) throw new UnauthorizedError();

  try {
    console.log('================');
    const payload = authService.getPayloadFromToken(token);
    console.log('payload', payload);
    if (!payload) throw new UnauthorizedError();
    console.log('payload.userId', payload.userId, Number.isInteger(payload.userId));

    // User has old JWT token, now only uuid is used
    if (Number.isInteger(payload.userId)) {
      throw new UnauthorizedError();
    }
    console.log('llllllllllllllllllllllllllllllll', payload);
    
    customReq.payload = payload;
  } catch {
    throw new UnauthorizedError();
  }

  next();
};

export default authMiddleware;
