import { assert } from 'chai';
import sinon from 'sinon';
import pq from 'proxyquire';

const mockRequest = (body?, params?, query?, context?) => {
  return {
    body,
    params,
    query,
    context,
  };
};

const mockResponse = () => {
  const res: Record<string, any> = {};
  res.status = sinon.stub().returns(res);
  res.json = sinon.stub().returns(res);
  return res;
};
const createUserStub = sinon.stub().resolves({ id: 'random' });
const fetchUsersStub = sinon.stub().resolves([{ id: 'random' }]);
const getUserStub = sinon.stub().resolves({ id: 'random' });
const updateUserByIdStub = sinon.stub().resolves();
const deleteUserByIdStub = sinon.stub().resolves();

const userController = pq('../src/controllers/user', {
  '../services': {
    userService: {
      createUser: createUserStub,
      fetchUsers: fetchUsersStub,
      getUser: getUserStub,
      updateUserById: updateUserByIdStub,
      deleteUserById: deleteUserByIdStub,
    },
  },
});

describe('User controllers >', () => {
  beforeEach(() => {
    createUserStub.reset();
    createUserStub.resolves({ id: 'random' });

    fetchUsersStub.reset();
    fetchUsersStub.resolves([{ id: 'random' }]);

    getUserStub.reset();
    getUserStub.resolves({ id: 'random' });

    updateUserByIdStub.reset();
    updateUserByIdStub.resolves();

    deleteUserByIdStub.reset();
    deleteUserByIdStub.resolves();
  });

  describe('createNewUser >', () => {
    describe('when requested to', () => {
      it('should call the user service with correct params', async () => {
        const res = mockResponse();
        const user = {
          email: 'validEmail@gmail.com',
          password: 'randomPassword',
          roles: [{ name: 'REGULAR', someRandomField: 'lol' }],
        };

        let error;
        await userController.createNewUser(
          mockRequest({
            ...user,
          }),
          res,
          (e) => (error = e)
        );

        assert.isUndefined(error);

        const userToBeInserted = createUserStub.getCall(0).args[0];

        assert.equal(userToBeInserted.email, user.email);
        assert.isNotEmpty(userToBeInserted.auth.password);
        assert.equal(userToBeInserted.roles.length, 1);
        assert.equal(userToBeInserted.roles[0].name, 'REGULAR');
        assert.isUndefined(userToBeInserted.roles[0].someRandomField);
      });

      it('should return the correct response', async () => {
        const res = mockResponse();
        const user = {
          email: 'validEmail@gmail.com',
          password: 'randomPassword',
          roles: [{ name: 'REGULAR', someRandomField: 'lol' }],
        };

        let error;
        await userController.createNewUser(
          mockRequest({
            ...user,
          }),
          res,
          (e) => (error = e)
        );

        assert.isUndefined(error);
        assert.equal(res.status.getCall(0).args[0], 200);
        assert.equal(res.json.getCall(0).args[0].data.userId, 'random');
      });
    });
  });

  describe('fetchUsers', () => {
    describe('when requested to', () => {
      it('should call the user fetching service with correct params', async () => {
        const res = mockResponse();
        let error;
        await userController.fetchUsers(
          mockRequest(
            {},
            {},
            {
              id: 'random1',
              role: 'ADMIN',
            },
            {
              user: {
                id: 'random2',
                roles: [{ name: 'REGULAR' }],
              },
            }
          ),
          res,
          (e) => (error = e)
        );

        assert.isUndefined(error);

        const [params, options] = fetchUsersStub.getCall(0).args;

        assert.equal(params.id, 'random2');
        assert.equal(params.role, 'ADMIN');
        assert.isUndefined(params.email);

        assert.equal(options.skip, 0);
        assert.equal(options.limit, 100);
      });

      it('should return the correct response', async () => {
        const res = mockResponse();
        let error;
        await userController.fetchUsers(
          mockRequest(
            {},
            {},
            {
              id: 'random1',
              role: 'ADMIN',
            },
            {
              user: {
                id: 'random2',
                roles: [{ name: 'REGULAR' }],
              },
            }
          ),
          res,
          (e) => (error = e)
        );

        assert.isUndefined(error);

        assert.equal(res.status.getCall(0).args[0], 200);
        assert.equal(res.json.getCall(0).args[0].data.length, 1);
        assert.equal(res.json.getCall(0).args[0].data[0].id, 'random');
      });
    });
  });

  describe('fetchUserById', () => {
    describe('when requested to', () => {
      it('should call the user fetching service with correct params', async () => {
        const res = mockResponse();
        let error;
        await userController.fetchUserById(
          mockRequest(
            {},
            {
              userId: 'random1',
            },
            {},
            {
              user: {
                id: 'random1',
                roles: [{ name: 'REGULAR' }],
              },
            }
          ),
          res,
          (e) => (error = e)
        );

        assert.isUndefined(error);

        const [params] = getUserStub.getCall(0).args;
        assert.equal(params.id, 'random1');
      });

      it('should return the correct response', async () => {
        const res = mockResponse();
        let error;
        await userController.fetchUserById(
          mockRequest(
            {},
            {
              userId: 'random1',
            },
            {},
            {
              user: {
                id: 'random1',
                roles: [{ name: 'REGULAR' }],
              },
            }
          ),
          res,
          (e) => (error = e)
        );

        assert.isUndefined(error);

        assert.equal(res.status.getCall(0).args[0], 200);
        assert.equal(res.json.getCall(0).args[0].data.id, 'random');
      });
    });
  });

  describe('deleteUserById', () => {
    describe('when requested to', () => {
      it('should call the user deleting service with correct params', async () => {
        const res = mockResponse();
        let error;
        await userController.deleteUserById(
          mockRequest(
            {},
            {
              userId: 'random1',
            },
            {},
            {}
          ),
          res,
          (e) => (error = e)
        );

        assert.isUndefined(error);

        const [fetchParam] = deleteUserByIdStub.getCall(0).args;
        assert.equal(fetchParam, 'random1');
      });

      it('should return the correct response', async () => {
        const res = mockResponse();
        let error;
        await userController.deleteUserById(
          mockRequest(
            {},
            {
              userId: 'random1',
            },
            {},
            {}
          ),
          res,
          (e) => (error = e)
        );

        assert.isUndefined(error);

        assert.equal(res.status.getCall(0).args[0], 200);
        assert.isUndefined(res.json.getCall(0).args[0].data);
      });
    });
  });
});
