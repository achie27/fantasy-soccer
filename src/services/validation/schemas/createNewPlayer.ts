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
  required: ['firstName', 'lastName', 'type', 'country'],
};
