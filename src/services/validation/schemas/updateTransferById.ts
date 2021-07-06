export default {
  $async: true,
  type: 'object',
  properties: {
    player: {
      type: 'object',
      properties: {
        id: {
          type: 'string',
          validPlayerId: true,
        },
      },
      required: ['id'],
    },
    buyNowPrice: {
      type: 'number',
      minimum: 0,
    },
  },
  minProperties: 1,
};
