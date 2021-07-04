import { PlayerNotFound } from '../lib/exceptions';
import { utilityService } from '../services';
import { playerModel, teamModel } from '../models';

const generateDOB = () => {
  const birthdate = new Date();
  birthdate.setFullYear(
    utilityService.getRandInt(
      birthdate.getFullYear() - 40,
      birthdate.getFullYear() - 18
    )
  );
  return birthdate;
};

export const createPlayer = async (params: {
  type: typeof playerModel.playerTypes[number];
  firstName: string;
  lastName: string;
  country: string;
  birthdate?: Date;
  team?: {
    id: string;
  };
}) => {
  const player: Parameters<typeof playerModel.insert>[0] = {
    ...params,
    birthdate: params.birthdate || generateDOB(),
    value: 1000000,
  };

  if (player.team?.id) {
    const [team] = await teamModel.fetchTeams({ id: player.team.id });
    player.team.ownerId = team.owner.id;
  }

  const newPlayer = await playerModel.insert(player);

  if (player.team?.id) {
    const [team] = await teamModel.fetchTeams({ id: newPlayer.team.id });
    // TODO: teamModel.addPlayerToTeam
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

  if (modelParams.age) {
    modelParams.birthdate = {};
    Object.keys(modelParams.age).forEach((op) => {
      const age = modelParams.age[op];
      const birthdate = new Date();
      birthdate.setFullYear(birthdate.getFullYear() - age);

      modelParams.birthdate[op] = birthdate;
    });
    delete modelParams.age;
  }

  return await playerModel.fetchPlayers(modelParams);
};

export const fetchPlayerById = async ({
  id,
  ownerId,
}: {
  id: string;
  ownerId?: string;
}) => {
  const params: Record<string, any> = { id };
  if (ownerId) {
    params.team = { ownerId };
  }

  return await playerModel.fetchPlayers(params)[0];
};

export const updatePlayer = async (params, updatedFields) => {
  const modelParams: Parameters<typeof playerModel.updatePlayer>[0] = {
    id: params.id,
  };

  if (params.ownerId) {
    modelParams.team = { ownerId: params.ownerId };
  }

  const updates: Parameters<typeof playerModel.updatePlayer>[1] = {
    ...updatedFields,
  };

  if (updates.team?.id || updates.value) {
    const [player] = await playerModel.fetchPlayers({ id: modelParams.id });
    const [oldTeam] = await teamModel.fetchTeams({ id: player.team.id });

    const [newTeam] = await teamModel.fetchTeams({ id: updates.team.id });

    // oldTeam.value -= player.value;
    // oldTeam.players = oldTeam.players.filter((p) => p.id !== player.id);

    await teamModel.removePlayerFromTeam(oldTeam.id, player);

    // newTeam.value += updates.value || player.value;
    // newTeam.players.push({ id: player.id });

    player.value = updates.value || player.value;

    await teamModel.addPlayerToTeam(newTeam.id, player);
    updates.team = { id: newTeam.id, ownerId: newTeam.owner.id };
    // await Promise.all([
    //   teamModel.updateTeam({ id: oldTeam.id }, oldTeam),
    //   teamModel.updateTeam({ id: newTeam.id }, newTeam),
    // ]);
  }

  await playerModel.updatePlayer(modelParams, updates);
};

export const deletePlayer = async (player) => {
  await teamModel.removePlayerFromTeam(player.team.id, player);
  // const [team] = await teamModel.fetchTeams({ id: player.team.id });

  // team.value -= player.value;
  // team.players = team.players.filter((p) => p.id !== player.id);

  await playerModel.deletePlayer(player.id);
};

export const getUncappedPlayers = async (params) => {
  const uncappedPlayers = [];

  await Promise.all(
    Object.keys(params.type).map(async (type) => {
      const players = await teamModel.fetchPlayers({ type, team: null });

      while (players.length < params.type[type]) {
        const newPlayer = {
          firstName: utilityService.generateRandomName('first'),
          lastName: utilityService.generateRandomName('last'),
          type,
          country: utilityService.getRandomCountry(),
          birthdate: generateDOB(),
          value: 1000000,
        };

        players.push(newPlayer);
      }

      uncappedPlayers.push(...players);
    })
  );

  return uncappedPlayers;
};
