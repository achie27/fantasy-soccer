import jwt from 'jsonwebtoken';

import logger from '../lib/logger';
import { accessTokenSecret, accessTokenExpiry } from '../config';
import { InvalidAccessToken } from '../lib/exceptions';

export const generateAccessToken = (user) => {
  const jwtPayload = {
    id: user.id,
    roles: user.roles,
  };

  return jwt.sign(jwtPayload, accessTokenSecret, {
    expiresIn: accessTokenExpiry,
  });
};

export const decodeAccessToken = (token: string) => {
  try {
    return jwt.verify(token, accessTokenSecret);
  } catch (e) {
    logger.error(e);
    throw new InvalidAccessToken(e.message);
  }
};

export const verifyAccessToken = decodeAccessToken;
