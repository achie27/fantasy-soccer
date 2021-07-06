import { playerModel } from '../../../models';

export default {
  $async: true,
  type: 'object',
  properties: {
    firstName: {
      type: 'string',
      minLength: 1
    },
    lastName: {
      type: 'string',
      minLength: 1
    },
    type: {
      type: 'string',
      enum: playerModel.playerTypes
    },
    country: {
      type: 'string',
      validCountry: true,
    },
    birthdate: {
      type: 'string',
      format: 'date-time',
    },
    team: {
      type: 'object',
      properties: {
        id: {
          type: 'string',
          validTeamId: true,
        },
      },
      required: ['id'],
    },
  },
  required: ['firstName', 'lastName', 'type', 'country'],
};
