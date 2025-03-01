import { NextFunction, Request, Response } from 'express';
import DomainError from '../errors/domain.error';
import UnauthorizedError from '../errors/unauthorized.error';

export default (
  error: Error,
  request: Request,
  response: Response,
  next: NextFunction,
) => {  
  if (error instanceof DomainError) {
    response.status(400).json({ msg: error.message });
  } else if (error instanceof UnauthorizedError) {
    response.status(401).json({ msg: 'Authorization required' });
  } else {
    response.status(500).json({ msg: 'Internal Server Error' });
  }

  next();
};
