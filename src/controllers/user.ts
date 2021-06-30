import express from "express";

import { UserNotFound, InadequatePermissions } from "../lib/exceptions";
import { userService, utilityService } from "../services";

export const createNewUser = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  try {
    const { email, password, roles } = req.body;
    const user: Record<string, any> = { 
      email, 
      auth: { password }, 
    };

    if (roles) user.roles = roles.map(r => ({ name: r.name }));;

    const createdUser = await userService.createUser(user);
    return res.status(200).json({ data: { userId: createdUser.id } });
  } catch (e) {
    next(e);
  }
};

export const fetchUsers = async (
  req: express.Request & { context: Record<string, any> },
  res: express.Response,
  next: express.NextFunction
) => {
  try {
    const params: Record<string, any> = { };
    if (req.query.id) params.id = req.query.id;
    if (req.query.email) params.email = req.query.email;
    if (req.query.role) params.role = req.query.role;

    if (!req.context.user.roles.map((r) => r.name).includes("ADMIN"))
      params.id = req.context.user.id;
    
    const users = await userService.fetchUsers(params);
    return res.status(200).json({ data: users });
  } catch (e) {
    next(e);
  }
};

export const fetchUserById = async (
  req: express.Request & { context: Record<string, any> },
  res: express.Response,
  next: express.NextFunction
) => {
  try {
    if (!req.context.user.roles.map((r) => r.name).includes("ADMIN") && req.params.userId !== req.context.user.id)
      throw new UserNotFound(req.params.userId);
    
    const user = await userService.getUser({ id: req.params.userId });
    return res.status(200).json({ data: user });

  } catch (e) {
    next(e);
  }
};

export const updateUserById = async (
  req: express.Request & { context: Record<string, any> },
  res: express.Response,
  next: express.NextFunction
) => {
  try {
    if (!req.context.user.roles.map((r) => r.name).includes("ADMIN") && req.params.userId !== req.context.user.id)
      throw new InadequatePermissions();
    
    const toUpdate: Record<string, any> = { };

    if (req.body.email) toUpdate.email = req.body.email;
    if (req.body.auth?.password) toUpdate.auth = { password: req.body.auth.password };
    if (req.body.roles) toUpdate.roles = req.body.roles.map(r => ({ name: r.name }));

    const updatedUser = await userService.updateUserById({ id: req.params.userId }, toUpdate);
    return res.status(200).json({ data: updatedUser });
  } catch (e) {
    next(e);
  }
};

export const deleteUserById = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  try {
    /**
     * 1. Release all players
     * 2. Delete all transfer requests
     * 3. Delete team
     */
    const deletedUser = await userService.deleteUserById({ id: req.params.userId });
    return res.status(200).json({ data: deletedUser });
  } catch (e) {
    next(e);
  }
};
