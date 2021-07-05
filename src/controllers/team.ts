import express from 'express';
import { TeamNotFound } from '../lib/exceptions';

import { teamService, utilityService } from '../services';

export const createNewTeam = async (
  req: express.Request & { context: Record<string, any> },
  res: express.Response,
  next: express.NextFunction
) => {
  try {
    const team: Record<string, any> = {
      name: req.body.name,
      country: req.body.country,
    };

    if (req.body?.players)
      team.players = req.body.players.map((p) => ({ id: p.id }));

    if (req.body?.owner?.id) {
      if (req.context.user.roles.map((r) => r.name).includes('ADMIN')) {
        team.owner = { id: req.body.owner.id };
      } else {
        team.owner = { id: req.context.user.id };
      }
    } else {
      team.owner = { id: req.context.user.id };
    }

    const createdteam = await teamService.createTeam(team);
    return res.status(200).json({ data: { teamId: createdteam.id } });
  } catch (e) {
    next(e);
  }
};

export const fetchTeams = async (
  req: express.Request & { context: Record<string, any> },
  res: express.Response,
  next: express.NextFunction
) => {
  try {
    const params: Record<string, any> = {};
    if (req.query.id) params.id = req.query.id;
    if (req.query.name) params.name = req.query.name;
    if (req.query.country) params.country = req.query.country;
    if (req.query.playerId) params.playerId = req.query.playerId;
    if (req.query.ownerId) params.ownerId = req.query.ownerId;

    if (req.query.value)
      params.value = utilityService.extractComparisonOperators(
        req.query.value as Record<string, any>
      );

    if (req.query.budget)
      params.budget = utilityService.extractComparisonOperators(
        req.query.budget as Record<string, any>
      );

    if (!req.context.user.roles.map((r) => r.name).includes('ADMIN'))
      params.ownerId = req.context.user.id;

    const teams = await teamService.fetchTeams(params, {
      skip: Number(req.query.skip) || 0,
      limit: Number(req.query.limit) || 100,
    });
    return res.status(200).json({ data: teams });
  } catch (e) {
    next(e);
  }
};

export const fetchTeamById = async (
  req: express.Request & { context: Record<string, any> },
  res: express.Response,
  next: express.NextFunction
) => {
  try {
    const params: Record<string, any> = { id: req.params.teamId };

    if (!req.context.user.roles.map((r) => r.name).includes('ADMIN'))
      params.ownerId = req.context.user.id;

    const team = await teamService.fetchTeamById(params);
    if (!team) throw new TeamNotFound(req.params.teamId);

    return res.status(200).json({ data: team });
  } catch (e) {
    next(e);
  }
};

export const updateTeamById = async (
  req: express.Request & { context: Record<string, any> },
  res: express.Response,
  next: express.NextFunction
) => {
  try {
    const params: Record<string, any> = { id: req.params.teamId };
    const toUpdate: Record<string, any> = {};

    if (req.body.name) toUpdate.name = req.body.name;
    if (req.body.country) toUpdate.country = req.body.country;
    if (req.body.players)
      toUpdate.players = req.body.players.map((p) => ({ id: p.id }));

    if (req.context.user.roles.map((r) => r.name).includes('ADMIN')) {
      if (req.body.owner?.id) toUpdate.owner = { id: req.body.owner.id };
      if (req.body.budget) toUpdate.budget = req.body.budget;
    } else {
      params.ownerId = req.context.user.id;
    }

    const updatedTeam = await teamService.updateTeamById(params, toUpdate);
    return res.status(200).json({ data: updatedTeam });
  } catch (e) {
    next(e);
  }
};

export const deleteTeamById = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  try {
    /**
     * 1. Remove all transfers
     * 2. Remove from owner/user
     * 3. Release players
     */

    const team = await teamService.fetchTeamById({
      id: req.params.teamId,
    });
    if (!team) throw new TeamNotFound(req.params.teamId);

    await teamService.deleteTeam(team);
    return res.status(200).json({});
  } catch (e) {
    next(e);
  }
};
