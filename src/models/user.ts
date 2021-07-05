import { Schema, Model, model, Document, Types, LeanDocument } from 'mongoose';
import { v4 as uuid } from 'uuid';

import {
  InternalServerError,
  IncorrectPassword,
  UserNotFound,
} from '../lib/exceptions';
import logger from '../lib/logger';
import { utilityService } from '../services';

export const userRoles = ['REGULAR', 'ADMIN'] as const;

export interface IUser {
  id: string;
  email: string;
  auth: {
    password: string;
  };
  roles: Array<{ name: typeof userRoles[number] }>;
  teams: Array<{ id: string }>;
}

const userSchema = new Schema<IUser>({
  id: { type: String, required: true, index: true, unique: true },
  email: { type: String, required: true, index: true, unique: true },
  auth: {
    password: { type: String, required: true },
  },
  roles: [
    {
      _id: false,
      name: { type: String, enum: userRoles, default: userRoles[0] },
    },
  ],
  teams: [
    {
      _id: false,
      id: { type: String, required: true },
    },
  ],
});

export interface IUserDocument extends IUser, Document {
  id: string;
}

const User: Model<IUserDocument> = model('User', userSchema, 'users');

type SanitisedUser = Pick<
  LeanDocument<IUserDocument>,
  'id' | 'email' | 'roles' | 'teams'
>;

const sanitiseDoc = (user: IUserDocument): SanitisedUser => {
  const toReturn = user.toJSON();

  delete toReturn.__v;
  delete toReturn.auth;
  delete toReturn._id;

  return toReturn;
};

export const insert = async (userDetails: {
  email: IUser['email'];
  auth: IUser['auth'];
  roles?: IUser['roles'];
  teams?: IUser['teams'];
}): Promise<SanitisedUser> => {
  try {
    const user: IUserDocument = new User({ ...userDetails, id: uuid() });
    user.auth.password = await utilityService.hash(user.auth.password);

    return sanitiseDoc(await user.save());
  } catch (e) {
    logger.error(e);
    throw new InternalServerError();
  }
};

export const getUser = async (
  userDetails: utilityService.AtLeastOne<{
    id: IUser['id'];
    email: IUser['email'];
  }>
): Promise<SanitisedUser> => {
  try {
    return sanitiseDoc(await User.findOne(userDetails));
  } catch (e) {
    logger.error(e);
    throw new InternalServerError();
  }
};

export const updateUserById = async (
  id: IUser['id'],
  toUpdate: utilityService.AtLeastOne<Omit<IUser, 'id'>>
): Promise<void> => {
  try {
    const res = await User.updateOne({ id }, { $set: toUpdate });
    if (res.n === 0) throw new UserNotFound(id);
  } catch (e) {
    logger.error(e);
    throw new InternalServerError();
  }
};

export const fetchUsers = async (
  userDetails: utilityService.AtLeastOne<{
    id: IUser['id'];
    email: IUser['email'];
    roles: IUser['roles'];
  }>
): Promise<SanitisedUser[]> => {
  try {
    const params = { ...userDetails };
    if (params.roles) {
      params['roles.name'] = { $in: params.roles.map(p => p.name) };
    }
    return (await User.find(params)).map(sanitiseDoc);
  } catch (e) {
    logger.error(e);
    throw new InternalServerError();
  }
};

export const deleteUser = async (id: IUser['id']): Promise<void> => {
  try {
    await User.deleteOne({ id });
  } catch (e) {
    logger.error(e);
    throw new InternalServerError();
  }
};

export const addTeamToUserById = async (
  id: IUser['id'],
  teamId: string
): Promise<void> => {
  try {
    await User.updateOne({ id }, { $addToSet: { teams: { id: teamId } } });
  } catch (e) {
    logger.error(e);
    throw new InternalServerError();
  }
};

export const removeTeamFromUserById = async (
  id: IUser['id'],
  teamId: string
): Promise<void> => {
  try {
    await User.updateOne({ id }, { $pull: { teams: { id: teamId } } });
  } catch (e) {
    logger.error(e);
    throw new InternalServerError();
  }
};

export const checkUserPassword = async (
  id: IUser['id'],
  password: string
): Promise<void> => {
  try {
    const user = await User.findOne({ id }, { 'auth.password': 1, _id: 0 });
    if (!(await utilityService.compareWithHash(password, user.auth.password)))
      throw new IncorrectPassword();
  } catch (e) {
    logger.error(e);
    throw new InternalServerError();
  }
};

export const doesUserExist = async (
  id: string,
): Promise<boolean> => {
  const res = await User.findOne({ id }, { _id: 0, id: 0 });
  if (res) return true;
  return false;
};
