import v4 from 'uuid';

import { UserNotFound } from '../lib/exceptions';
import { utilityService, teamService } from '.';
import { userModel, transferModel } from '../models';

export const checkUserPassword = async (id, text) => {
  await userModel.checkUserPassword(id, text);
};

export const createUser = async (params: {
  email: userModel.IUser['email'];
  auth: userModel.IUser['auth'];
  roles?: userModel.IUser['roles'];
}) => {
  const newUser = await userModel.insert(params);
  const newTeam = await teamService.createTeam({
    name: `${newUser.id}'s Team`,
    country: utilityService.getRandomCountry(),
    owner: {
      id: newUser.id,
    },
  });

  return { ...newUser, teams: [{ id: newTeam.id }] };
};

export const fetchUsers = async (params) => {
  const modelParams = { ...params };
  if (modelParams.role) {
    modelParams.roles = { name: modelParams.role };
    delete modelParams.role;
  }

  return await userModel.fetchUsers(modelParams);
};

export const getUser = async (
  params: utilityService.AtLeastOne<{ id; email }>
) => {
  return await userModel.getUser(params);
};

export const updateUserById = async (id, toUpdate) => {
  return await userModel.updateUserById(id, toUpdate);
};

export const deleteUserById = async (id) => {
  const user = await userModel.getUser({ id });
  if (!user) throw new UserNotFound(id);

  await Promise.all([
    transferModel.deleteTransfersOfUserById(id),
    Promise.all(
      user.teams.map(
        async (t) =>
          await teamService.deleteTeam({ id: t.id, owner: { id: user.id } })
      )
    ),
    userModel.deleteUser(id),
  ]);
};
