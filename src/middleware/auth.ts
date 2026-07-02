import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    name: string;
    email: string;
  };
}

export const authMiddleware = (req: AuthRequest, res: Response, next: NextFunction): any => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'No token, authorization denied' });
  }

  const token = authHeader.split(' ')[1];
  if (!token) {
    return res.status(401).json({ message: 'No token found' });
  }

  const secret: string = process.env['JWT_SECRET'] || 'study-chat-jwt-secret';

  try {
    const decoded = jwt.verify(token, secret) as unknown as {
      id: string;
      name: string;
      email: string;
    };
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Token is not valid' });
  }
};
