import { Schema, Model, model, Document, Types, LeanDocument } from 'mongoose';
import { v4 as uuid } from 'uuid';

export const playerTypes = [
  'GOALKEEPER',
  'DEFENDER',
  'MIDFIELDER',
  'ATTACKER',
] as const;

import { InternalServerError, PlayerNotFound } from '../lib/exceptions';
import logger from '../lib/logger';
import { utilityService } from '../services';
import { AtLeastOne } from '../services/utility';

export interface IPlayer {
  id: string;
  type: typeof playerTypes[number];
  firstName: string;
  lastName: string;
  value: number;
  country: string;
  birthdate: Date;
  team: {
    id: string;
    ownerId: string;
  };
}

const playerSchema = new Schema<IPlayer>({
  id: { type: String, required: true, index: true, unique: true },
  type: { type: String, enum: playerTypes, required: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  value: { type: Number, required: true },
  country: { type: String, required: true },
  birthdate: { type: Date, required: true },
  team: {
    id: { type: String },
    ownerId: { type: String },
  },
});

export interface IPlayerDocument extends IPlayer, Document {
  id: string;
}

const Player: Model<IPlayerDocument> = model('Player', playerSchema, 'players');

type SanitisedPlayer = Pick<
  LeanDocument<IPlayerDocument>,
  | 'id'
  | 'type'
  | 'firstName'
  | 'lastName'
  | 'value'
  | 'country'
  | 'birthdate'
  | 'team'
>;

const sanitiseDoc = (user: IPlayerDocument): SanitisedPlayer => {
  const toReturn = user.toJSON();

  delete toReturn.__v;
  delete toReturn._id;

  return toReturn;
};

export const insert = async (playerDetails: {
  type: typeof playerTypes[number];
  firstName: string;
  lastName: string;
  value: number;
  country: string;
  birthdate: Date;
  team?: {
    id?: string;
    ownerId?: string;
  };
}): Promise<SanitisedPlayer> => {
  try {
    const player: IPlayerDocument = new Player({
      ...playerDetails,
      id: uuid(),
    });

    return sanitiseDoc(await player.save());
  } catch (e) {
    logger.error(e);
    throw new InternalServerError();
  }
};

export const deletePlayer = async (id: string): Promise<void> => {
  try {
    await Player.deleteOne({ id });
  } catch (e) {
    logger.error(e);
    throw new InternalServerError();
  }
};

export const fetchPlayersInBulkByIds = async (
  ids: string[]
): Promise<SanitisedPlayer[]> => {
  try {
    const players = await Player.find({ id: { $in: ids } });
    return players.map(sanitiseDoc);
  } catch (e) {
    logger.error(e);
    throw new InternalServerError();
  }
};

export const updatePlayer = async (
  params: { id: string; team?: { ownerId: string } },
  updates: AtLeastOne<Omit<IPlayer, 'id'>>
): Promise<void> => {
  try {
    const res = await Player.updateOne({
      id: params.id,
      ...(params.team?.ownerId && { 'team.ownerId': params.team.ownerId }),
    }, { $set: updates });
    if (res.n === 0) throw new PlayerNotFound(params.id);
  } catch (e) {
    logger.error(e);
    throw new InternalServerError();
  }
};

export const fetchPlayers = async (params: {
  id?: string;
  type?: string;
  firstName?: string;
  lastName?: string;
  value?: utilityService.ComparisonOperators<number>;
  country?: string;
  birthdate?: utilityService.ComparisonOperators<Date>;
  team?: {
    id: string;
    ownerId: string;
  };
  uncapped?: boolean
}): Promise<SanitisedPlayer[]> => {
  try {
    console.log(params);

    const p: Record<string, any> = { ...params };
    if (p.value)
      p.value = utilityService.convertToMongoCompOperators<number>(
        params.value
      );
    if (p.birthdate)
      p.birthdate = utilityService.convertToMongoCompOperators<Date>(
        params.birthdate
      );

    if (p.team) {
      if (p.team.id) {
        p['team.id'] = p.team.id;
      }

      if (p.team.ownerId) {
        p['team.ownerId'] = p.team.ownerId;
      }
      delete p.team;
    }

    if (p.uncapped) {
      p['$or'] = [
        { 'team': { $exists: false } },
        { 'team': { $eq: null } },
      ];

      delete p.uncapped;
      delete p['team.ownerId'];
    }

    const players = await Player.find(p);
    return players.map(sanitiseDoc);
  } catch (e) {
    logger.error(e);
    throw new InternalServerError();
  }
};

export const doesPlayerExist = async (id: string): Promise<boolean> => {
  const res = await Player.findOne({ id }, { _id: 0, id: 1 });
  if (res) return true;
  return false;
};
