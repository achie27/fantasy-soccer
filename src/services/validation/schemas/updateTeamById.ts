export default {
  $async: true,
  type: 'object',
  properties: {
    name: {
      type: 'string',
      minLength: 1
    },
    country: {
      type: 'string',
      validCountry: true,
    },
    budget: {
      type: 'number',
      minimum: 0,
    },
    owner: {
      type: 'object',
      properties: {
        id: {
          type: 'string',
          validUserId: true,
        },
      },
      required: ['id'],
    },
    players: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
            validPlayerId: true,
          },
        },
        required: ['id'],
      },
    },
  },
  minProperties: 1,
};
