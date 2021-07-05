import jwt from 'jsonwebtoken';

import logger from '../lib/logger';
import {
  refreshTokenSecret,
  refreshTokenExpiry,
  accessTokenSecret,
  accessTokenExpiry,
} from '../config';
import { InvalidAccessToken, InvalidRefreshToken } from '../lib/exceptions';

export const generateAccessToken = (user) => {
  const jwtPayload = {
    id: user.id,
    roles: user.roles,
  };

  return jwt.sign(jwtPayload, accessTokenSecret, {
    expiresIn: accessTokenExpiry,
  });
};

export const generateRefreshToken = (user) => {
  const jwtPayload = {
    id: user.id,
  };

  return jwt.sign(jwtPayload, refreshTokenSecret, {
    expiresIn: refreshTokenExpiry,
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

export const decodeRefreshToken = (token: string) => {
  try {
    return jwt.verify(token, refreshTokenSecret);
  } catch (e) {
    logger.error(e);
    throw new InvalidRefreshToken(e.message);
  }
};

export const verifyRefreshToken = decodeRefreshToken;
