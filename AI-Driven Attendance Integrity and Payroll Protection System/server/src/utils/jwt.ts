import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'dayflow_super_secret_jwt_key_2026_hackathon';

export interface TokenPayload {
  userId: string;
  email: string;
  role: string;
  employeeId?: string;
}

export const signToken = (payload: TokenPayload): string => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
};

export const verifyToken = (token: string): TokenPayload => {
  return jwt.verify(token, JWT_SECRET) as TokenPayload;
};
