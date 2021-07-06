export default {
  $async: true,
  type: 'object',
  properties: {
    name: {
      type: 'string',
      minLength: 1,
    },
    country: {
      type: 'string',
      validCountry: true,
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
  required: ['name', 'country'],
};
