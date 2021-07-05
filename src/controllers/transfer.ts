import express from 'express';

import {
  InadequatePermissions,
  InvalidTransferRequest,
  TeamNotFound,
  TransferNotFound,
} from '../lib/exceptions';
import {
  playerService,
  teamService,
  transferService,
  utilityService,
} from '../services';

export const createNewTransfer = async (
  req: express.Request & { context: Record<string, any> },
  res: express.Response,
  next: express.NextFunction
) => {
  try {
    const transfer = {
      player: { id: req.body.player.id },
      initiatorTeam: {
        id: req.body.initiatorTeam.id,
        ownerId: req.context.user.id,
      },
      buyNowPrice: req.body.buyNowPrice,
    };

    if (!req.context.user.roles.map((r) => r.name).includes('ADMIN')) {
      const player = await playerService.fetchPlayerById({
        id: transfer.player.id,
        ownerId: transfer.initiatorTeam.ownerId,
      });
      if (!player) {
        throw new InadequatePermissions();
      }
    }

    const createdTransfer = await transferService.createTransfer(transfer);
    return res.status(200).json({ data: { transferId: createdTransfer.id } });
  } catch (e) {
    next(e);
  }
};

export const buyPlayerNow = async (
  req: express.Request & { context: Record<string, any> },
  res: express.Response,
  next: express.NextFunction
) => {
  try {
    /**
     * 0. Check if the new team has enough budget
     * 1. Remove from og team, update the team's value, update the team's budget
     * 2. Add to the new team, update the team's value, update the team's budget
     * 3. Update the player's value and team
     * 4. Mark the transger settled
     */

    const teamFetchParams: Record<string, any> = { id: req.body.team.id };

    if (!req.context.user.roles.map((r) => r.name).includes('ADMIN'))
      teamFetchParams.ownerId = req.context.user.id;

    const toTeam = await teamService.fetchTeamById(teamFetchParams);
    // should be inadeuate permissions actually
    if (!toTeam) throw new TeamNotFound(req.body.team.id);

    const transfer = await transferService.fetchTransferById({
      id: req.params.transferId,
    });
    if (!transfer) throw new TransferNotFound(req.params.transferId);
    if (transfer.initiatorTeam.id === toTeam.id)
      throw new InvalidTransferRequest('Cannot transfer into the same team');

    await transferService.settleTransfer(transfer, toTeam);

    return res.status(200).json({});
  } catch (e) {
    next(e);
  }
};

export const fetchTransfers = async (
  req: express.Request & { context: Record<string, any> },
  res: express.Response,
  next: express.NextFunction
) => {
  try {
    const params: Record<string, any> = {};
    if (req.query.id) params.id = req.query.id;
    if (req.query.status) params.status = req.query.status;
    if (req.query.playerId) params.playerId = req.query.playerId;
    if (req.query.playerTeamName)
      params.playerTeamName = req.query.playerTeamName;
    if (req.query.playerCountry) params.playerCountry = req.query.playerCountry;

    if (req.query.playerValue)
      params.playerValue = utilityService.extractComparisonOperators(
        req.query.playerValue as Record<string, any>
      );

    if (req.query.buyNowPrice)
      params.buyNowPrice = utilityService.extractComparisonOperators(
        req.query.buyNowPrice as Record<string, any>
      );

    const transfers = await transferService.fetchTransfers(params, {
      skip: Number(req.query.skip) || 0,
      limit: Number(req.query.limit) || 100,
    });
    return res.status(200).json({ data: transfers });
  } catch (e) {
    next(e);
  }
};

export const fetchTransferById = async (
  req: express.Request & { context: Record<string, any> },
  res: express.Response,
  next: express.NextFunction
) => {
  try {
    const params: Parameters<typeof transferService.fetchTransferById>[0] = {
      id: req.params.transferId,
    };

    const transfer = await transferService.fetchTransferById(params);
    if (!transfer) throw new TransferNotFound(params.id);

    return res.status(200).json({ data: transfer });
  } catch (e) {
    next(e);
  }
};

export const updateTransferById = async (
  req: express.Request & { context: Record<string, any> },
  res: express.Response,
  next: express.NextFunction
) => {
  try {
    const params: Record<string, any> = { id: req.params.transferId };
    const toUpdate: Record<string, any> = {};

    if (!req.context.user.roles.map((r) => r.name).includes('ADMIN'))
      params.ownerId = req.context.user.id;

    if (req.body.player?.id) toUpdate.player = { id: req.body.player.id };
    if (req.body.buyNowPrice) toUpdate.buyNowPrice = req.body.buyNowPrice;

    const updatedTransfer = await transferService.updateTransferById(
      params,
      toUpdate
    );

    return res.status(200).json({ data: updatedTransfer });
  } catch (e) {
    next(e);
  }
};

export const deleteTransferById = async (
  req: express.Request & { context: Record<string, any> },
  res: express.Response,
  next: express.NextFunction
) => {
  try {
    const params: Parameters<typeof transferService.fetchTransferById>[0] = {
      id: req.params.transferId,
    };

    if (!req.context.user.roles.map((r) => r.name).includes('ADMIN'))
      params.ownerId = req.context.user.id;

    const transfer = await transferService.fetchTransferById(params);
    if (!transfer) throw new TransferNotFound(req.params.transferId);

    await transferService.deleteTransfer(transfer);
    return res.status(200).json({});
  } catch (e) {
    next(e);
  }
};
