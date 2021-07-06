import {
  PlayerInDifferentTeam,
  InadequateBudget,
  InadequatePermissions,
  TransferNotOpen,
  PlayerNotFound,
  InvalidTransferRequest,
  InvalidInput,
  TransferNotFound,
} from '../lib/exceptions';

import { playerService, teamService, utilityService } from '../services';
import { transferModel } from '../models';

export const createTransfer = async (params) => {
  const transfer: Parameters<typeof transferModel.insert>[0] = { ...params };

  const player = await playerService.fetchPlayerById({
    id: transfer.player.id,
  });
  if (!player) {
    throw new PlayerNotFound(transfer.player.id);
  }

  if (!player.team?.id) {
    throw new InvalidInput('The player is uncapped and not in the team');
  }

  if (player.team.id !== transfer.initiatorTeam.id) {
    throw new InadequatePermissions();
  }

  const pendingTransfers = await transferModel.fetchTransfers(
    {
      player: { id: transfer.player.id },
      status: 'OPEN',
    },
    {
      skip: 0,
      limit: 1,
    }
  );
  if (pendingTransfers.length > 0) {
    throw new InvalidTransferRequest(
      `${transfer.player.id} already has pending transfer`
    );
  }

  transfer.status = 'OPEN';
  transfer.openedDate = new Date();

  return await transferModel.insert(transfer);
};

export const fetchTransferById = async ({
  id,
  ownerId,
}: {
  id: string;
  ownerId?: string;
}) => {
  return await transferModel.fetchTransferById({ id, ownerId });
};

export const settleTransfer = async (transfer, toTeam) => {
  if (transfer.status !== 'OPEN') {
    throw new TransferNotOpen(transfer.id);
  }

  if (transfer.buyNowPrice > toTeam.budget) {
    throw new InadequateBudget(toTeam.id);
  }

  const player = await playerService.fetchPlayerById({
    id: transfer.player.id,
  });

  await Promise.all([
    playerService.updatePlayer(
      { id: transfer.player.id },
      {
        team: { id: toTeam.id },
        value:
          (player.value * (100 + utilityService.getRandInt(10, 100))) / 100,
      }
    ),
    teamService.incrementTeamBudgetById(
      transfer.initiatorTeam.id,
      transfer.buyNowPrice
    ),
    teamService.incrementTeamBudgetById(toTeam.id, -transfer.buyNowPrice),
    transferModel.closeTransfer(transfer.id, toTeam),
  ]);
};

export const fetchTransfers = async (params, options) => {
  const modelParams = { ...params, player: {}, initiatorTeam: {} };

  if (modelParams.playerId) {
    modelParams.player.id = modelParams.playerId;
    delete modelParams.playerId;
  }

  if (modelParams.playerFirstName) {
    modelParams.player.firstName = modelParams.playerFirstName;
    delete modelParams.playerFirstName;
  }

  if (modelParams.playerLastName) {
    modelParams.player.lastName = modelParams.playerLastName;
    delete modelParams.playerLastName;
  }

  if (modelParams.playerCountry) {
    modelParams.player.country = modelParams.playerCountry;
    delete modelParams.playerCountry;
  }

  if (modelParams.playerValue) {
    modelParams.player.value = modelParams.playerValue;
    delete modelParams.playerValue;
  }

  if (modelParams.playerTeamName) {
    modelParams.initiatorTeam.name = modelParams.playerTeamName;
    delete modelParams.playerTeamName;
  }

  if (Object.keys(modelParams.player).length === 0) delete modelParams.player;

  if (Object.keys(modelParams.initiatorTeam).length === 0)
    delete modelParams.initiatorTeam;

  return await transferModel.fetchTransfers(modelParams, options);
};

export const updateTransferById = async (params, updatedFields) => {
  const transfer = await transferModel.fetchTransferById(params);
  if (!transfer) throw new TransferNotFound(params.id);
  if (transfer.status !== 'OPEN') throw new TransferNotOpen(transfer.id);

  if (updatedFields.player?.id) {
    const player = await playerService.fetchPlayerById({
      id: updatedFields.player.id,
    });

    if (player.team.id !== transfer.initiatorTeam.id)
      throw new PlayerInDifferentTeam(player.id);
  }

  return await transferModel.updateTransferById(
    { id: params.id },
    updatedFields
  );
};

export const deleteTransfer = async (transfer) => {
  if (transfer.status !== 'OPEN') throw new TransferNotOpen(transfer.id);

  await transferModel.deleteTransferById(transfer.id);
};
