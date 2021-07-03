import express from 'express';

import {
  InvalidAccessToken,
  InadequatePermissions,
  UserNotFound,
} from '../lib/exceptions';
import { userService, authService } from '../services';

export const registerUser = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  try {
    const { email, password } = req.body;
    const user = { email, auth: { password } };

    const createdUser = await userService.createUser(user);
    return res.status(200).json({ data: { userId: createdUser.id } });
  } catch (e) {
    next(e);
  }
};

export const generateNewToken = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  try {
    const { email, password } = req.body;

    const user = await userService.getUser({ email });
    if (!user) throw new UserNotFound(email);

    await userService.checkUserPassword(user.id, password);

    const accessToken = authService.generateAccessToken(user);

    return res.status(200).json({ data: { id: user.id, accessToken } });
  } catch (e) {
    next(e);
  }
};

export const populateUserContext = async (
  req: express.Request & { context: Record<string, any> },
  res: express.Response,
  next: express.NextFunction
) => {
  try {
    const accessToken: string = req.header['access-token'];
    if (accessToken) {
      const decoded = authService.decodeAccessToken(accessToken);
      req.context = { user: decoded };
      next();
    } else {
      throw new InvalidAccessToken(accessToken);
    }
  } catch (e) {
    next(e);
  }
};

export const verifyAuth = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  try {
    const accessToken: string = req.header['access-token'];
    if (accessToken) {
      const valid = authService.verifyAccessToken(accessToken);
      if (valid) next();
      else throw new InvalidAccessToken(accessToken);
    } else {
      return res.status(403).end();
    }
  } catch (e) {
    next(e);
  }
};

export const verifyRole = (allowedRoles: string[]) => {
  return async (
    req: express.Request & { context: Record<string, any> },
    res: express.Response,
    next: express.NextFunction
  ) => {
    try {
      let hasAccess: boolean = false;

      req.context?.user?.roles.forEach((role) => {
        if (allowedRoles.includes(role.name)) hasAccess = true;
      });

      if (hasAccess) return next();

      throw new InadequatePermissions();
    } catch (e) {
      next(e);
    }
  };
};
