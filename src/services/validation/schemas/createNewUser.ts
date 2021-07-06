import { userModel } from '../../../models';

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
    roles: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          name: { type: 'string', enum: userModel.userRoles },
        },
        required: ['name'],
      },
    },
  },
  required: ['email', 'password'],
};
