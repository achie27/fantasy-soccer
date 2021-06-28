import express from "express";
import validator from "validator";
import jwt from "jsonwebtoken";

import { accessTokenSecret, accessTokenExpiry } from "../config";
import { userService, utilityService } from "../services";

export const register = async (req: express.Request, res: express.Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ error: "REQUIRED_FIELDS_MISSING" });

    if (!validator.isEmail(email))
      return res.status(400).json({ error: "INCORRECT_EMAIL" });

    const user = {
      // id: uuid(),
      email,
      auth: { password },
      roles: [{ name: 'REGULAR' }],
    };

    const { err, data } = await userService.createUser(user);
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "INTERNAL_SERVER_ERROR" });
    }

    return res
      .status(200)
      .json({ data: { id: data.id } });

  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "INTERNAL_SERVER_ERROR" });
  }
};

export const generateNewToken = async (req: express.Request, res: express.Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ error: "REQUIRED_FIELDS_MISSING" });

    if (!validator.isEmail(email))
      return res.status(400).json({ error: "INCORRECT_EMAIL" });

    const { err, data: user } = await userService.getUser({
      email,
    });

    if (err) {
      console.error(err);
      return res.status(500).json({ error: "INTERNAL_SERVER_ERROR" });
    }

    if (!user.id || !user.email)
      return res.status(400).json({ error: "USER_NOT_REGISTERED" });

    if (!(await utilityService.compareHash(password, user?.auth?.password)))
      return res.status(400).json({ error: "INCORRECT_PASSWORD" });

    const token = jwt.sign(
      { id: user.id, roles: user.roles },
      accessTokenSecret,
      { expiresIn: accessTokenExpiry }
    );

    return res
      .status(200)
      .json({ data: { id: user.id, accessToken: token } });

  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "INTERNAL_SERVER_ERROR" });
  }
};

export const populateUserContext = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  try {
    const accessToken: string = req.header["access-token"];
    if (accessToken) {
      try {
        const decoded = jwt.verify(accessToken, accessTokenSecret);
        req["context"] = { user: decoded };
        next();
      } catch (e) {
        console.error(e);
        return res.status(400).json({ error: "COULD_NOT_VERIFY_ACCESS_TOKEN" });
      }
    } else {
      return res.status(403).end();
    }
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "INTERNAL_SERVER_ERROR" });
  }
};

export const verifyAuth = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  try {
    const accessToken: string = req.header["access-token"];
    if (accessToken) {
      try {
        jwt.verify(accessToken, accessTokenSecret);
        next();
      } catch (e) {
        console.error(e);
        return res.status(400).json({ error: "COULD_NOT_VERIFY_ACCESS_TOKEN" });
      }
    } else {
      return res.status(403).end();
    }
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "INTERNAL_SERVER_ERROR" });
  }
};

export const verifyRole = (allowedRoles: string[]) => {
  return async (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    try {
      let hasAccess: boolean = false;

      req["context"]?.user?.roles.forEach(
        (role: userService.IUser["roles"][0]) => {
          if (allowedRoles.includes(role.name)) hasAccess = true;
        }
      );

      if (hasAccess) return next();
      return res.status(403).end();
    } catch (e) {
      console.error(e);
      return res.status(500).json({ error: "INTERNAL_SERVER_ERROR" });
    }
  };
};
