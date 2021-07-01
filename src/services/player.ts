import { PlayerNotFound } from '../lib/exceptions';
import { playerModel, teamModel } from '../models';

export const createPlayer = async (player) => {
  const newPlayer: Record<string, any> = await playerModel.insert(player);
  if(player.team?.id) {
    await teamModel.addPlayerToTeam(player.team.id, newPlayer);
  }

  return newPlayer;
};

export const fetchPlayers = async (params) => {
  const modelParams = { ...params };

  if (modelParams.uncapped) {
    delete modelParams.uncapped;
    modelParams.team = { id: null };
  }

  if (modelParams.teamId) {
    modelParams.team = { id: modelParams.teamId };
    delete modelParams.teamId;
  }

  if (modelParams.ownerId) {
    if (modelParams.team)
      modelParams.team.ownerId = modelParams.ownerId;
    else
      modelParams.team = { ownerId: modelParams.ownerId };

    delete modelParams.ownerId;
  }

  return await playerModel.fetchPlayers(modelParams);
};

export const fetchPlayerById = async ({ id, ownerId }) => {
  const params: Record<string, any> = { id };
  if (ownerId) {
    params.team = { ownerId };
  }

  return await playerModel.fetchPlayers(params)[0];
};

export const updatePlayer = async (params, updatedFields) => {
  const modelParams = { ...params };
  if (modelParams.ownerId) {
    modelParams.team = { ownerId: modelParams.ownerId };
    delete modelParams.ownerId;
  }

  if (updatedFields.team?.id || updatedFields.value) {
    const [ player ] = await playerModel.fetchPlayers({ id: modelParams.id });
    const [ oldTeam ] = await teamModel.fetchTeams({ id: player.team.id });

    const [ newTeam ] = await teamModel.fetchTeams({ id: updatedFields.team.id });

    oldTeam.value -= updatedFields.value || player.value;
    oldTeam.players = oldTeam.players.filter(p => p.id !== player.id);
    
    newTeam.value += updatedFields.value || player.value;
    newTeam.players.push({ id: player.id });

    updatedFields.team = { id: newTeam.id, ownerId: newTeam.owner.id };

    await Promise.all([
      await teamModel.updateTeam({ id: oldTeam.id }, oldTeam),
      await teamModel.updateTeam({ id: newTeam.id }, newTeam)
    ]);
  }

  const updated = await playerModel.updatePlayer(modelParams, updatedFields)
  if (!updated) throw new PlayerNotFound(modelParams.id);

  return updated;
};

export const deletePlayer = async (player) => {
  const [ team ] = await teamModel.fetchTeams({ id: player.team.id });

  team.value -= player.value;
  team.players = team.players.filter(p => p.id !== player.id);
  
  await teamModel.updateTeam({ id: team.id }, team);
  await playerModel.deletePlayer({ id:  player.id });
};

