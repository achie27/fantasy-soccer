export default {
  type: 'object',
  properties: {
    email: {
      type: 'string'
    },
    auth: {
      type: 'object',
      properties: {
        password: {
          type: 'string'
        }
      },
      required: ['password']
    },
    roles: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          name: 'string'
        },
        required: ['name']
      }
    }
  },
  required: ['email', 'auth']
};