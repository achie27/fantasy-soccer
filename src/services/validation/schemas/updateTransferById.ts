export default {
  type: 'object',
  properties: {
    player: {
      type: 'object',
      properties: {
        id: {
          type: 'string',
        },
      },
      required: ['id'],
    },
    buyNowPrice: {
      type: 'number',
    },
  },
  minProperties: 1,
};
