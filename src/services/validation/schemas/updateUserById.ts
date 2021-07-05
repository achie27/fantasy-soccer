import { userModel } from '../../../models';

export default {
  type: 'object',
  properties: {
    email: {
      type: 'string',
      format: 'email',
    },
    auth: {
      type: 'object',
      properties: {
        password: {
          type: 'string',
        },
      },
      required: ['password'],
    },
    roles: {
      type: 'array',
      items:
        {
          type: 'object',
          properties: {
            name: { type: 'string', enum: userModel.userRoles },
          },
          required: ['name'],
        },
    },
  },
  minProperties: 1,
};
