import { PlayerNotFound } from '../lib/exceptions';
import { utilityService } from '../services';
import { playerModel, teamModel } from '../models';

const generateDOB = () => {
  const birthDate = new Date();
  birthDate.setFullYear(utilityService.getRandInt(birthDate.getFullYear() - 40, birthDate.getFullYear() - 18));
  return birthDate;
};

export const createPlayer = async (params) => {
  const player = {...params, value: 1000000 };

  if (!params.birthDate) {
    player.birthDate = generateDOB();
  }

  const newPlayer: Record<string, any> = await playerModel.insert(player);

  if (player.team?.id) {
    const [team] = await teamModel.fetchTeams({ id: newPlayer.team.id });

    team.value += newPlayer.value;
    team.players.push({ id: newPlayer.id });

    await teamModel.updateTeam({ id: team.id }, team);
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
    if (modelParams.team) modelParams.team.ownerId = modelParams.ownerId;
    else modelParams.team = { ownerId: modelParams.ownerId };

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
    const [player] = await playerModel.fetchPlayers({ id: modelParams.id });
    const [oldTeam] = await teamModel.fetchTeams({ id: player.team.id });

    const [newTeam] = await teamModel.fetchTeams({ id: updatedFields.team.id });

    // oldTeam.value -= player.value;
    // oldTeam.players = oldTeam.players.filter((p) => p.id !== player.id);

    await teamModel.removePlayerFromTeam(oldTeam.id, player);

    // newTeam.value += updatedFields.value || player.value;
    // newTeam.players.push({ id: player.id });

    player.value = updatedFields.value || player.value;

    await teamModel.addPlayerToTeam(newTeam.id, player);
    updatedFields.team = { id: newTeam.id, ownerId: newTeam.owner.id };
    // await Promise.all([
    //   teamModel.updateTeam({ id: oldTeam.id }, oldTeam),
    //   teamModel.updateTeam({ id: newTeam.id }, newTeam),
    // ]);
  }

  const updated = await playerModel.updatePlayer(modelParams, updatedFields);
  if (!updated) throw new PlayerNotFound(modelParams.id);

  return updated;
};

export const deletePlayer = async (player) => {
  await teamModel.removePlayerFromTeam(player.team.id, player);
  // const [team] = await teamModel.fetchTeams({ id: player.team.id });

  // team.value -= player.value;
  // team.players = team.players.filter((p) => p.id !== player.id);


  await playerModel.deletePlayer({ id: player.id });
};

export const getUncappedPlayers = async (params) => {
  const uncappedPlayers = [];
  
  await Promise.all(
    Object.keys(params.type).map(async type => {
      const players = await teamModel.fetchPlayers({ type, team: null });

      while (players.length < params.type[type]) {
        const newPlayer = {
          firstName: utilityService.generateRandomName('first'),
          lastName: utilityService.generateRandomName('last'),
          type,
          country: utilityService.getRandomCountry(),
          birthDate: generateDOB(),
          value: 1000000
        };
  
        players.push(newPlayer);
      }

      uncappedPlayers.push(...players);
    })  
  );

  return uncappedPlayers;
};