export default {
  type: 'object',
  properties: {
    firstName: {
      type: 'string'
    },
    lastName: {
      type: 'string'
    },
    type: {
      type: 'string'
    },
    country: {
      type: 'string'
    },
    birthDate: {
      type : "string",
      format : "date-time"
    },
    value: {
      type: 'number'
    },
    team: {
      type: 'object',
      properties: {
        id: {
          type: 'string'
        }
      },
      required: ['id']
    }
  },
  minProperties: 1
};