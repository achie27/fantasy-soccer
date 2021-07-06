import { NothingToUpdate } from '../lib/exceptions';
import { utilityService } from '../services';
import { playerModel, teamModel, transferModel } from '../models';

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
    const [team] = await teamModel.fetchTeams(
      { id: player.team.id },
      { skip: 0, limit: 1 }
    );
    player.team.ownerId = team.owner.id;
  }

  const newPlayer = await playerModel.insert(player);

  if (player.team?.id) {
    await teamModel.addPlayerToTeam(newPlayer.team.id, newPlayer);
  }

  return newPlayer;
};

export const fetchPlayers = async (params, options) => {
  const modelParams = { ...params };

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

      modelParams.birthdate[utilityService.reverseCompMap[op]] = birthdate;
    });
    delete modelParams.age;
  }

  return await playerModel.fetchPlayers(modelParams, options);
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

  const [player] = await playerModel.fetchPlayers(params, {
    skip: 0,
    limit: 1,
  });
  return player;
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
    const [player] = await playerModel.fetchPlayers(
      { id: modelParams.id },
      { skip: 0, limit: 1 }
    );

    if (player.team?.id) {
      const [oldTeam] = await teamModel.fetchTeams(
        { id: player.team.id },
        { skip: 0, limit: 1 }
      );
      await teamModel.removePlayerFromTeam(oldTeam.id, player);
    }

    const [newTeam] = await teamModel.fetchTeams(
      { id: updates.team.id },
      { skip: 0, limit: 1 }
    );
    player.value = updates.value || player.value;

    await Promise.all([
      teamModel.addPlayerToTeam(newTeam.id, player),
      transferModel.deleteOpenTransferOfPlayerById(player.id),
    ]);

    updates.team = { id: newTeam.id, ownerId: newTeam.owner.id };
  }

  if (Object.keys(updates).length === 0) throw new NothingToUpdate();

  await playerModel.updatePlayer(modelParams, updates);
};

export const deletePlayer = async (player) => {
  await Promise.all([
    transferModel.deleteOpenTransferOfPlayerById(player.id),
    teamModel.removePlayerFromTeam(player.team.id, player),
    playerModel.deletePlayer(player.id),
  ]);
};

export const getUncappedPlayers = async (params) => {
  const uncappedPlayers = [];

  await Promise.all(
    Object.keys(params.type).map(async (type: playerModel.IPlayer['type']) => {
      const players = await playerModel.fetchPlayers(
        { type, uncapped: true },
        { skip: 0, limit: 20 }
      );

      while (players.length < params.type[type]) {
        const newPlayer = await playerModel.insert({
          firstName: utilityService.generateRandomName('first'),
          lastName: utilityService.generateRandomName('last'),
          type,
          country: utilityService.getRandomCountry(),
          birthdate: generateDOB(),
          value: 1000000,
        });

        players.push(newPlayer);
      }
      uncappedPlayers.push(...players);
    })
  );

  return uncappedPlayers;
};
