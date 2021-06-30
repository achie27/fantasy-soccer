import express from "express";

import {
  InvalidAccessToken,
  InadequatePermissions,
  PlayerNotFound,
} from "../lib/exceptions";
import { playerService, utilityService, authService } from "../services";

export const createNewPlayer = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  try {
    const player: Record<string, any> = {
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      type: req.body.type,
      country: req.body.country,
      birthdate: req.body.birthdate,
    };

    if (req.body?.team?.id) player.team = { id: req.body.team.id };

    const createdPlayer = await playerService.createPlayer(player);

    return res.status(200).json({ data: { playerId: createdPlayer.id } });
  } catch (e) {
    next(e);
  }
};

export const fetchPlayers = async (
  req: express.Request & { context: Record<string, any> },
  res: express.Response,
  next: express.NextFunction
) => {
  try {
    const params: Record<string, any> = {};
    if (req.query.id) params.id = req.query.id;
    if (req.query.type) params.type = req.query.type;
    if (req.query.country) params.country = req.query.country;
    if (req.query.teamId) params.teamId = req.query.teamId;
    if (req.query.uncapped) params.uncapped = req.query.uncapped;
    if (req.query.firstName) params.firstName = req.query.firstName;
    if (req.query.lastName) params.lastName = req.query.lastName;
    if (req.query.value)
      params.value = utilityService.extractComparisonOperators(
        req.query.value as Record<string, any>
      );
    if (req.query.age)
      params.age = utilityService.extractComparisonOperators(
        req.query.age as Record<string, any>
      );

    if (!req.context.user.roles.map((r) => r.name).includes("ADMIN"))
      params.ownerId = req.context.user.id;

    const players = await playerService.fetchPlayers(params);
    return res.status(200).json({ data: players });
  } catch (e) {
    next(e);
  }
};

export const fetchPlayerById = async (
  req: express.Request & { context: Record<string, any> },
  res: express.Response,
  next: express.NextFunction
) => {
  try {
    const params: Record<string, any> = { id: req.params.playerId };

    if (!req.context.user.roles.map((r) => r.name).includes("ADMIN"))
      params.ownerId = req.context.user.id;

    const player = await playerService.fetchPlayerById(params);
    if (!player) throw new PlayerNotFound(params.id);

    return res.status(200).json({ data: player });
  } catch (e) {
    next(e);
  }
};

export const updatePlayerById = async (
  req: express.Request & { context: Record<string, any> },
  res: express.Response,
  next: express.NextFunction
) => {
  try {
    const params: Record<string, any> = { id: req.params.playerId };
    const toUpdate: Record<string, any> = {};

    if (req.body.type) toUpdate.type = req.body.type;
    if (req.body.country) toUpdate.country = req.body.country;
    if (req.body.firstName) toUpdate.firstName = req.body.firstName;
    if (req.body.lastName) toUpdate.lastName = req.body.lastName;

    if (req.context.user.roles.map((r) => r.name).includes("ADMIN")) {
      if (req.body.value) toUpdate.value = req.body.value;
      if (req.body.birthDate) toUpdate.birthDate = req.body.birthDate;
      if (req.body.team?.id) toUpdate.team = { id: req.body.team.id };
    } else {
      params.ownerId = req.context.user.id;
    }

    const updatedPlayer = await playerService.updatePlayer(params, toUpdate);
    return res.status(200).json({ data: updatedPlayer });
  } catch (e) {
    next(e);
  }
};

export const deletePlayerById = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  try {
    /**
     * 1. Remove from transfer list
     * 2. Remove from Team
     * 3. Update Team's value
     * 4. Remove the player
     */

    const player = await playerService.fetchPlayerById({
      id: req.params.playerId,
    });
    if (!player) throw new PlayerNotFound(req.params.playerId);

    await playerService.deletePlayer(player);
    return res.status(200).json({});
  } catch (e) {
    next(e);
  }
};
