export default {
  $async: true,
  type: 'object',
  properties: {
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
  required: ['team'],
};
