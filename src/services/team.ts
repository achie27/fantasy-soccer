import {
  PlayerNotFound,
  PlayerAlreadyContracted,
  MaxTeamsLimitReached,
} from '../lib/exceptions';
import { maxTeamsLimit } from '../constants';

import { playerService } from '../services';
import { teamModel, playerModel, userModel, transferModel } from '../models';

export const createTeam = async (params) => {
  const team = { ...params };

  if (team.players?.length) {
    const players = await playerModel.fetchPlayersInBulkByIds(
      team.players.map((p) => p.id)
    );
    team.value = players.reduce((acc, curPlayer) => acc + curPlayer.value, 0);
  } else {
    const players = await playerService.getUncappedPlayers({
      type: {
        goalkeeper: 3,
        defender: 6,
        midfielder: 6,
        attacker: 5,
      },
    });

    team.value = players.reduce((acc, curPlayer) => acc + curPlayer.value, 0);
    team.players = players.map((p) => ({ id: p.id }));
  }

  team.budget = 5000000;

  const newTeam: Record<string, any> = await teamModel.insert(team);

  // should be idempotent
  await userModel.addTeamToUserById(team.owner.id, team.id);
  await Promise.all(
    team.players.map((p) =>
      playerModel.updatePlayer(
        { id: p.id },
        { team: { id: newTeam.id, ownerId: newTeam.owner.id } }
      )
    )
  );

  return newTeam;
};

export const fetchTeams = async (params) => {
  const modelParams = { ...params };

  if (modelParams.playerId) {
    modelParams.players = { id: modelParams.playerId };
    delete modelParams.playerId;
  }

  if (modelParams.ownerId) {
    modelParams.owner = { id: modelParams.ownerId };
    delete modelParams.ownerId;
  }

  return await teamModel.fetchTeams(modelParams);
};

export const fetchTeamById = async ({ id, ownerId }) => {
  const params: Record<string, any> = { id };
  if (ownerId) {
    params.owner = { id: ownerId };
  }

  return await teamModel.fetchTeams(params)[0];
};

export const updateTeamById = async (params, updatedFields) => {
  const modelParams = { ...params };

  if (modelParams.ownerId) {
    modelParams.owner = { id: modelParams.ownerId };
    delete modelParams.ownerId;
  }

  const [team] = await teamModel.fetchTeams(modelParams);

  // should either be uncapped or in the same team
  if (updatedFields.players) {
    const newPlayers = await playerModel.fetchPlayers(
      updatedFields.players.map((p) => p.id)
    );

    for (const p of newPlayers) {
      if (p.team?.id !== team.id) {
        throw new PlayerAlreadyContracted(p.id);
      } else {
        // either uncapped or already in this team
      }
    }

    const oldPlayersToRemove = [];
    team.players.forEach((p) => {
      if (newPlayers.findIndex((p2) => p2.id === p.id) === -1)
        oldPlayersToRemove.push(p);
    });

    await Promise.all(
      oldPlayersToRemove.map((p) =>
        teamModel.removePlayerFromTeam(team.id, p.id)
      )
    );
  }

  if (updatedFields.owner?.id) {
    const user = await userModel.getUser(updatedFields.owner.id);
    if (user.teams?.length >= maxTeamsLimit) {
      throw new MaxTeamsLimitReached(user.id);
    }

    await Promise.all([
      userModel.removeTeamFromUserById(team.owner.id, team.id),
      userModel.addTeamToUserById(updatedFields.owner.id, team.id),
      Promise.all(
        team.players.map(async (p) => {
          await playerModel.updatePlayer({ id: p.id }, {
            team: { id: team.id, ownerId: updatedFields.owner.id },
          });
        })
      ),
    ]);
  }

  await teamModel.updateTeam(modelParams, updatedFields);
};

export const deleteTeam = async (team) => {
  await Promise.all([
    transferModel.deleteTransfersOfTeamById(team.id),
    userModel.removeTeamFromUserById(team.owner.id, team.id),
    Promise.all(
      team.players.map(async (p) => {
        await playerModel.updatePlayer({ id: p.id }, { team: null });
      })
    ),
    teamModel.deleteTeam(team.id),
  ]);
};

export const incrementTeamBudgetById = async (id, inc) => {
  await teamModel.incrementTeamBudgetById(id, inc);
};
