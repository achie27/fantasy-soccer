export default {
  $async: true,
  type: 'object',
  properties: {
    firstName: {
      type: 'string',
    },
    lastName: {
      type: 'string',
    },
    type: {
      type: 'string',
    },
    country: {
      type: 'string',
      validCountry: true,
    },
    birthdate: {
      type: 'string',
      format: 'date-time',
    },
    value: {
      type: 'number',
    },
    team: {
      type: 'object',
      properties: {
        id: {
          type: 'string',
          validTeamId: true
        },
      },
      required: ['id'],
    },
  },
  minProperties: 1,
};
