import v4 from 'uuid'; 

import { IncorrectPassword, UserNotFound } from '../lib/exceptions';
import { utilityService, teamService } from '.';
import { teamModel, userModel, transferModel } from '../models';

export const assertPasswordCorrectness = async (text, hashedUserPassword) => {
  if (!await utilityService.compareWithHash(text, hashedUserPassword))
    throw new IncorrectPassword();
};

export const createUser = async (params) => {
  const user = { ...params };
  user.auth.password = await utilityService.hash(user.auth.password);

  const newUser = await userModel.insert(user);
  const newTeam = await teamService.createTeam({
    name: `${newUser.id}'s Team`,
    country: utilityService.getRandomCountry(),
    owner: {
      id: newUser.id
    }
  })

  return { ...newUser, teams: [{ id: newTeam.id }] };
};

export const fetchUsers = async (params) => {
  const modelParams = {...params};
  if (modelParams.role) {
    modelParams.roles = { name: modelParams.role };
    delete modelParams.role;
  }

  return await userModel.fetchUsers(modelParams);
};

export const getUser = async ({ id, email }) => {
  const params = { };
  if (id) params.id = id;
  if (email) params.email = email;

  return await userModel.getUser(params);
};

export const updateUserById = async (id, toUpdate) => {
  const updates = { ...toUpdate };
  if (updates.auth?.password) {
    updates.auth.password = await utilityService.hash(updates.auth.password);
  }

  return await userModel.updateUser(id, updates);
};

export const deleteUserById = async (id) => {
  const user = await userModel.getUser({ id });    
  if (!user) throw new UserNotFound(id);

  await Promise.all([
    transferModel.deleteTransfersOfUserById(id),
    Promise.all(
      user.teams.map(async t => await teamService.deleteTeam({ id: t.id, owner: { id: user.id } }))
    ),
    userModel.deleteUser(id)
  ]);
};

