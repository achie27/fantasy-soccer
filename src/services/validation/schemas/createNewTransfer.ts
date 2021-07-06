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
    initiatorTeam: {
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
  required: ['player', 'buyNowPrice', 'initiatorTeam'],
};
