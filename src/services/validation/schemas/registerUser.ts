export default {
  type: 'object',
  properties: {
    email: {
      type: 'string',
      format: 'email',
    },
    password: {
      type: 'string',
      minLength: 1,
    },
  },
  required: ['email', 'password'],
};
