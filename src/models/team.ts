import { Schema, Model, model, Document, Types, LeanDocument } from 'mongoose';
import { v4 as uuid } from 'uuid';

import { InternalServerError, TeamNotFound } from '../lib/exceptions';
import logger from '../lib/logger';
import { utilityService } from '../services';
import { AtLeastOne } from '../services/utility';

export interface ITeam {
  id: string;
  name: string;
  budget: number;
  value: number;
  country: string;
  players: {
    id: string;
  }[];
  owner: {
    id: string;
  };
}

const teamSchema = new Schema<ITeam>({
  id: { type: String, required: true, index: true, unique: true },
  name: { type: String, required: true },
  budget: { type: Number, required: true, default: 0 },
  value: { type: Number, required: true, default: 0 },
  country: { type: String, required: true },
  players: [
    {
      _id: false,
      id: { type: String, required: true },
    },
  ],
  owner: {
    id: { type: String, required: true, index: true },
  },
});

export interface ITeamDocument extends ITeam, Document {
  id: string;
}

const Team: Model<ITeamDocument> = model('Team', teamSchema, 'teams');

type SanitisedTeam = Pick<
  LeanDocument<ITeamDocument>,
  'id' | 'name' | 'budget' | 'value' | 'country' | 'players' | 'owner'
>;

const sanitiseDoc = (user: ITeamDocument): SanitisedTeam => {
  const toReturn = user.toJSON();

  delete toReturn.__v;
  delete toReturn._id;

  return toReturn;
};

export const insert = async (teamDetails: {
  name: string;
  budget: number;
  value: number;
  country: string;
  players: {
    id: string;
  }[];
  owner: {
    id: string;
  };
}): Promise<SanitisedTeam> => {
  try {
    const team: ITeamDocument = new Team({
      ...teamDetails,
      id: uuid(),
    });

    return sanitiseDoc(await team.save());
  } catch (e) {
    logger.error(e);
    throw new InternalServerError();
  }
};

export const addPlayerToTeam = async (
  id: string,
  player: {
    id: string;
    value: number;
  }
): Promise<void> => {
  const res = await Team.updateOne(
    { id },
    { $inc: { value: player.value }, $addToSet: { players: { id: player.id } } }
  );
  if (!res.n) throw new TeamNotFound(id);
};

export const removePlayerFromTeam = async (
  id: string,
  player: {
    id: string;
    value: number;
  }
): Promise<void> => {
  const res = await Team.updateOne(
    { id },
    { $inc: { value: -player.value }, $pull: { players: { id: player.id } } }
  );
  if (!res.n) throw new TeamNotFound(id);
};

export const fetchTeams = async (
  params: {
    id?: string;
    name?: string;
    budget?: utilityService.ComparisonOperators<number>;
    value?: utilityService.ComparisonOperators<number>;
    country?: string;
    player?: {
      id: string;
    };
    owner?: {
      id: string;
    };
  },
  options: {
    skip: number;
    limit: number;
  }
): Promise<SanitisedTeam[]> => {
  try {
    const t: Record<string, any> = { ...params };
    if (t.value)
      t.value = utilityService.convertToMongoCompOperators<number>(
        params.value
      );
    if (t.budget)
      t.budget = utilityService.convertToMongoCompOperators<number>(
        params.budget
      );

    if (t.player?.id) {
      t['players.id'] = t.player.id;
      delete t.player;
    }

    if (t.owner?.id) {
      t['owner.id'] = t.owner.id;
      delete t.owner;
    }

    const teams = await Team.find(t, null, options).sort({ _id: 1 });
    return teams.map(sanitiseDoc);
  } catch (e) {
    logger.error(e);
    throw new InternalServerError();
  }
};

export const updateTeam = async (
  params: { id: string; owner?: { id: string } },
  updates: AtLeastOne<Omit<ITeam, 'id'>>
): Promise<void> => {
  const res = await Team.updateOne(params as any, { $set: updates });
  if (res.n === 0) throw new TeamNotFound(params.id);
};

export const deleteTeam = async (id: string): Promise<void> => {
  try {
    await Team.deleteOne({ id });
  } catch (e) {
    logger.error(e);
    throw new InternalServerError();
  }
};

export const incrementTeamBudgetById = async (
  id: string,
  inc: number
): Promise<void> => {
  const res = await Team.updateOne({ id }, { $inc: { budget: inc } });
  if (!res.n) throw new TeamNotFound(id);
};

export const doesTeamExist = async (id: string): Promise<boolean> => {
  const res = await Team.findOne({ id }, { _id: 0, id: 1 });
  if (res) return true;
  return false;
};
