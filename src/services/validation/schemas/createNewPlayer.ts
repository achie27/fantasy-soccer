export default {
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
        },
      },
      required: ['id'],
    },
  },
  required: ['firstName', 'lastName', 'type', 'country'],
};
