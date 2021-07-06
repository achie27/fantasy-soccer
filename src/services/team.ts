import {
  InadequateBudget,
  PlayerAlreadyContracted,
  MaxTeamsLimitReached,
  TeamNotFound,
} from '../lib/exceptions';
import { maxTeamsLimit } from '../constants';

import { playerService } from '../services';
import { teamModel, playerModel, userModel, transferModel } from '../models';
import { ParameterDeclaration } from 'typescript';

export const createTeam = async (params) => {
  const team = { ...params };

  const user = await userModel.getUser({ id: team.owner.id });
  if (user.teams?.length >= maxTeamsLimit) {
    throw new MaxTeamsLimitReached(user.id);
  }

  if (team.players?.length) {
    const players = await playerModel.fetchPlayersInBulkByIds(
      team.players.map((p) => p.id)
    );

    for (const p of players) {
      if (p.team?.id && p.team?.id !== team.id) {
        throw new PlayerAlreadyContracted(p.id);
      }
    }

    team.value = players.reduce((acc, curPlayer) => acc + curPlayer.value, 0);
  } else {
    const players = await playerService.getUncappedPlayers({
      type: {
        GOALKEEPER: 3,
        DEFENDER: 6,
        MIDFIELDER: 6,
        ATTACKER: 5,
      },
    });

    team.value = players.reduce((acc, curPlayer) => acc + curPlayer.value, 0);
    team.players = players.map((p) => ({ id: p.id }));
  }

  team.budget = 5000000;

  const newTeam = await teamModel.insert(team);

  // should be idempotent
  await userModel.addTeamToUserById(team.owner.id, newTeam.id);
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

export const fetchTeams = async (params, options) => {
  const modelParams = { ...params };

  if (modelParams.playerId) {
    modelParams.player = { id: modelParams.playerId };
    delete modelParams.playerId;
  }

  if (modelParams.ownerId) {
    modelParams.owner = { id: modelParams.ownerId };
    delete modelParams.ownerId;
  }

  return await teamModel.fetchTeams(modelParams, options);
};

export const fetchTeamById = async (params) => {
  const modelParams: Parameters<typeof teamModel.fetchTeams>[0] = {
    id: params.id,
  };
  if (params.ownerId) {
    modelParams.owner = { id: params.ownerId };
  }
  const [team] = await teamModel.fetchTeams(modelParams, { skip: 0, limit: 1 });
  return team;
};

export const updateTeamById = async (params, updatedFields) => {
  const modelParams = { ...params };

  if (modelParams.ownerId) {
    modelParams.owner = { id: modelParams.ownerId };
    delete modelParams.ownerId;
  }

  const [team] = await teamModel.fetchTeams(modelParams, { skip: 0, limit: 1 });
  if (!team) throw new TeamNotFound(modelParams.id);

  // should either be uncapped or in the same team
  if (updatedFields.players) {
    const updatedRoster = await playerModel.fetchPlayersInBulkByIds(
      updatedFields.players.map((p) => p.id)
    );

    let newRecruitContractExpense = 0;
    for (const p of updatedRoster) {
      if (p.team?.id && p.team?.id !== team.id) {
        throw new PlayerAlreadyContracted(p.id);
      }

      // contract if uncapped
      if (!p.team?.id) {
        newRecruitContractExpense += p.value;
      }
    }

    if (newRecruitContractExpense > (updatedFields.budget || team.budget)) {
      throw new InadequateBudget(team.id);
    } else {
      updatedFields.budget = (updatedFields.budget || team.budget) - newRecruitContractExpense;
    }

    updatedFields.value = updatedRoster.reduce(
      (acc, curPlayer) => acc + curPlayer.value,
      0
    );

    const oldPlayerIds = [];
    team.players.forEach((p) => {
      if (updatedRoster.findIndex((p2) => p2.id === p.id) === -1) {
        oldPlayerIds.push(p.id);
      }
    });

    const oldPlayers = await playerModel.fetchPlayersInBulkByIds(oldPlayerIds);

    await Promise.all([
      Promise.all(
        oldPlayers.map(
          async (p) => await teamModel.removePlayerFromTeam(team.id, p)
        )
      ),
      Promise.all(
        oldPlayers.map(async (p) => {
          await playerModel.updatePlayer({ id: p.id }, { team: null });
        })
      ),
      Promise.all( 
        updatedRoster.map(async (p) => {
          await playerModel.updatePlayer({ id: p.id }, { team : { id: team.id, ownerId: team.owner.id }});
        })
      )
    ]);
  }

  if (updatedFields.owner?.id) {
    const user = await userModel.getUser({ id: updatedFields.owner.id });
    if (user.teams?.length >= maxTeamsLimit) {
      throw new MaxTeamsLimitReached(user.id);
    }

    await Promise.all([
      userModel.removeTeamFromUserById(team.owner.id, team.id),
      userModel.addTeamToUserById(updatedFields.owner.id, team.id),
      Promise.all(
        (updatedFields.players || team.players).map(async (p) => {
          await playerModel.updatePlayer(
            { id: p.id },
            {
              team: { id: team.id, ownerId: updatedFields.owner.id },
            }
          );
        })
      ),
    ]);
  }

  await teamModel.updateTeam(modelParams, updatedFields);
};

export const deleteTeam = async (team) => {
  const [teamToDel] = await teamModel.fetchTeams(
    { id: team.id },
    { skip: 0, limit: 1 }
  );

  await Promise.all([
    transferModel.deleteOpenTransfersOfTeamById(team.id),
    userModel.removeTeamFromUserById(team.owner.id, team.id),
    Promise.all(
      teamToDel.players.map(async (p) => {
        await playerModel.updatePlayer({ id: p.id }, { team: null });
      })
    ),
    teamModel.deleteTeam(team.id),
  ]);
};

export const incrementTeamBudgetById = async (id, inc) => {
  await teamModel.incrementTeamBudgetById(id, inc);
};
