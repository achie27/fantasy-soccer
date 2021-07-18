import { refreshTokenExpiry, accessTokenExpiry } from '../config';
import express from 'express';

import {
  InvalidAccessToken,
  InadequatePermissions,
  UserNotFound,
  InvalidRefreshToken,
  InvalidInput,
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
    const refreshToken = authService.generateRefreshToken(user);

    return res
      .cookie('access-token', accessToken, {
        maxAge: accessTokenExpiry,
        httpOnly: true,
        secure: true,
      })
      .cookie('refresh-token', refreshToken, {
        maxAge: refreshTokenExpiry,
        httpOnly: true,
        secure: true,
      })
      .status(200)
      .json({ data: { id: user.id, accessToken } });
  } catch (e) {
    next(e);
  }
};

export const refreshToken = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  try {
    const accessToken: string = req.header('access-token');
    const refreshToken: string = req.cookies['refresh-token'];
    if (accessToken && refreshToken) {
      const at: any = authService.decodeAccessToken(accessToken);
      const rt: any = authService.decodeRefreshToken(refreshToken);

      if (at.id === rt.id) {
        const user = await userService.getUser({ id: at.id });
        if (!user) throw new UserNotFound(at.id);

        const newAT = authService.generateAccessToken(user);
        return res
          .status(200)
          .json({ data: { id: at.id, accessToken: newAT } });
      } else {
        throw new InvalidInput('A token is incorrect');
      }
    } else {
      throw accessToken
        ? new InvalidRefreshToken(refreshToken)
        : new InvalidAccessToken(accessToken);
    }
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
    const accessToken: string = req.header('access-token');
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
