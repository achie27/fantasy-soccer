import { Schema, Model, model, Document, Types, LeanDocument } from 'mongoose';
import { v4 as uuid } from 'uuid';

import { InternalServerError, TransferNotFound } from '../lib/exceptions';
import logger from '../lib/logger';
import { utilityService } from '../services';
import { AtLeastOne } from '../services/utility';

export const transferStatuses = ['OPEN', 'COMPLETE'] as const;

export interface ITransfer {
  id: string;
  player: {
    id: string;
  };
  initiatorTeam: {
    id: string;
    ownerId: string;
  };
  buyNowPrice: number;
  status: typeof transferStatuses[number];
  openedDate: Date;
  completedDate?: Date;
  toTeam?: {
    id: string;
  };
}

const transferSchema = new Schema<ITransfer>({
  id: { type: String, required: true, index: true, unique: true },
  player: {
    id: { type: String, required: true, index: true },
  },
  initiatorTeam: {
    id: { type: String, required: true, index: true },
    ownerId: { type: String, required: true, index: true },
  },
  buyNowPrice: { type: Number, required: true },
  status: { type: String, enum: transferStatuses, required: true },
  openedDate: { type: Date, required: true },
  completedDate: { type: Date },
  toTeam: {
    id: { type: String, index: true },
  },
});

export interface ITransferDocument extends ITransfer, Document {
  id: string;
}

const Transfer: Model<ITransferDocument> = model(
  'Transfer',
  transferSchema,
  'transfers'
);

type SanitisedTransfer = Omit<LeanDocument<ITransferDocument>, '_id' | '__v'>;

type ExtendedTransfer = SanitisedTransfer & {
  player: {
    value: number;
    country: string;
  };
  initiatorTeam: {
    name: string;
  };
};

const metaDetailsJoinPipeline = [
  {
    $lookup: {
      from: 'players',
      let: { playerId: '$player.id' },
      pipeline: [
        {
          $match: {
            $expr: {
              $eq: ['$id', '$$playerId'],
            },
          },
        },
        {
          $project: {
            _id: 0,
            value: 1,
            country: 1,
            firstName: 1,
            lastName: 1
          },
        },
      ],
      as: 'playerMeta',
    },
  },
  {
    $lookup: {
      from: 'teams',
      let: { teamId: '$initiatorTeam.id' },
      pipeline: [
        {
          $match: {
            $expr: {
              $eq: ['$id', '$$teamId'],
            },
          },
        },
        {
          $project: {
            _id: 0,
            name: 1,
          },
        },
      ],
      as: 'teamMeta',
    },
  },
  {
    $addFields: {
      player: {
        $mergeObjects: [{ $arrayElemAt: ['$playerMeta', 0] }, '$player'],
      },
      initiatorTeam: {
        $mergeObjects: [{ $arrayElemAt: ['$teamMeta', 0] }, '$initiatorTeam'],
      },
    },
  },
];

const sanitiseDoc = (user: ITransferDocument): SanitisedTransfer => {
  const toReturn = user.toJSON();

  delete toReturn.__v;
  delete toReturn._id;

  return toReturn;
};

export const insert = async (transferDetails: {
  player: {
    id: string;
  };
  initiatorTeam: {
    id: string;
    ownerId: string;
  };
  buyNowPrice: number;
  status: typeof transferStatuses[number];
  openedDate: Date;
}): Promise<SanitisedTransfer> => {
  try {
    const transfer: ITransferDocument = new Transfer({
      ...transferDetails,
      id: uuid(),
    });

    return sanitiseDoc(await transfer.save());
  } catch (e) {
    logger.error(e);
    throw new InternalServerError();
  }
};

export const deleteOpenTransfersOfTeamById = async (
  teamId: string
): Promise<void> => {
  try {
    await Transfer.deleteMany({ 'initiatorTeam.id': teamId, status: 'OPEN' });
  } catch (e) {
    logger.error(e);
    throw new InternalServerError();
  }
};

export const deleteOpenTransfersOfUserById = async (
  userId: string
): Promise<void> => {
  try {
    await Transfer.deleteMany({
      'initiatorTeam.ownerId': userId,
      status: 'OPEN',
    });
  } catch (e) {
    logger.error(e);
    throw new InternalServerError();
  }
};


export const deleteOpenTransferOfPlayerById = async (
  playerId: string
): Promise<void> => {
  try {
    await Transfer.deleteMany({
      'player.id': playerId,
      status: 'OPEN',
    });
  } catch (e) {
    logger.error(e);
    throw new InternalServerError();
  }
};


export const updateOpenTransfersOfTeamById = async (
  teamId: string,
  ownerId: string
): Promise<void> => {
  try {
    await Transfer.updateMany({
      'initiatorTeam.id': teamId,
      status: 'OPEN',
    }, {
      $set: { 'initiatorTeam.ownerId': ownerId }
    });
  } catch (e) {
    logger.error(e);
    throw new InternalServerError();
  }
};


export const fetchTransfers = async (
  params: {
    id?: string;
    buyNowPrice?: utilityService.ComparisonOperators<number>;
    status?: string;
    player?: AtLeastOne<{
      id: string;
      value: utilityService.ComparisonOperators<number>;
      country: string;
      firstName: string;
      lastName: string
    }>;
    initiatorTeam?: AtLeastOne<{
      name: string;
      ownerId: string;
    }>;
  },
  options: {
    skip: number;
    limit: number;
  }
): Promise<Array<ExtendedTransfer>> => {
  try {
    const aggPipeline: any[] = [
      {
        $match: {
          ...(params.id && { id: params.id }),
          ...(params.buyNowPrice && {
            buyNowPrice: utilityService.convertToMongoCompOperators(
              params.buyNowPrice
            ),
          }),
          ...(params.status && { status: params.status }),
          ...(params.initiatorTeam?.ownerId && {
            'initiatorTeam.ownerId': params.initiatorTeam.ownerId,
          }),
          ...(params.player?.id && { 'player.id': params.player.id }),
        },
      },
      ...metaDetailsJoinPipeline,
      {
        $match: {
          ...(params.player?.value && {
            'player.value': utilityService.convertToMongoCompOperators(
              params.player.value
            ),
          }),
          ...(params.player?.country && {
            'player.country': params.player.country,
          }),
          ...(params.player?.firstName && {
            'player.firstName': params.player.firstName,
          }),
          ...(params.player?.lastName && {
            'player.lastName': params.player.lastName,
          }),
          ...(params.initiatorTeam?.name && {
            'initiatorTeam.name': params.initiatorTeam.name,
          }),
        },
      },
      {
        $project: {
          _id: 0,
          __v: 0,
          teamMeta: 0,
          playerMeta: 0,
        },
      },
      {
        $sort: { _id: 1 },
      },
      {
        $skip: options.skip,
      },
      {
        $limit: options.limit,
      },
    ];

    return await Transfer.aggregate(aggPipeline);
  } catch (e) {
    logger.error(e);
    throw new InternalServerError();
  }
};

export const fetchTransferById = async ({
  id,
  ownerId,
}: {
  id: string;
  ownerId?: string;
}): Promise<ExtendedTransfer> => {
  return (
    await fetchTransfers(
      { id, initiatorTeam: { ownerId } },
      { skip: 0, limit: 1 }
    )
  )[0];
};

export const updateTransferById = async (
  params: { id: string; ownerId?: string },
  updates: AtLeastOne<Pick<ITransfer, 'player' | 'buyNowPrice'>>
): Promise<void> => {
  try {
    const res = await Transfer.updateOne(
      {
        id: params.id,
        ...(params.ownerId && { 'initiatorTeam.ownerId': params.ownerId }),
      },
      { $set: updates }
    );
    if (res.n === 0) throw new TransferNotFound(params.id);
  } catch (e) {
    logger.error(e);
    throw new InternalServerError();
  }
};

export const deleteTransferById = async (id: string): Promise<void> => {
  try {
    await Transfer.deleteOne({ id });
  } catch (e) {
    logger.error(e);
    throw new InternalServerError();
  }
};

export const doesTransferExist = async (id: string): Promise<boolean> => {
  const res = await Transfer.findOne({ id }, { _id: 0, id: 1 });
  if (res) return true;
  return false;
};

export const closeTransfer = async (
  id: string,
  toTeam: {
    id: string;
  }
): Promise<void> => {
  try {
    const res = await Transfer.updateOne(
      {
        id,
      },
      { $set: { status: 'COMPLETE', completedDate: new Date(), toTeam } }
    );
    if (res.n === 0) throw new TransferNotFound(id);
  } catch (e) {
    logger.error(e);
    throw new InternalServerError();
  }
};
