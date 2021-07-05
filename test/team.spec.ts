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
const createTeamStub = sinon.stub().resolves({ id: 'random' });
const fetchTeamsStub = sinon.stub().resolves([{ id: 'random' }]);
const fetchTeamByIdStub = sinon.stub().resolves({ id: 'random' });
const updateTeamByIdStub = sinon.stub().resolves();
const deleteTeamStub = sinon.stub().resolves();

const teamController = pq('../src/controllers/team', {
  '../services': {
    teamService: {
      createTeam: createTeamStub,
      fetchTeams: fetchTeamsStub,
      fetchTeamById: fetchTeamByIdStub,
      updateTeamById: updateTeamByIdStub,
      deleteTeam: deleteTeamStub,
    },
  },
});

describe('Team controllers >', () => {
  beforeEach(() => {
    createTeamStub.reset();
    createTeamStub.resolves({ id: 'random' });

    fetchTeamsStub.reset();
    fetchTeamsStub.resolves([{ id: 'random' }]);

    fetchTeamByIdStub.reset();
    fetchTeamByIdStub.resolves({ id: 'random' });

    updateTeamByIdStub.reset();
    updateTeamByIdStub.resolves();

    deleteTeamStub.reset();
    deleteTeamStub.resolves();
  });

  describe('createNewTeam >', () => {
    it('should call the team service with correct params', async () => {
      const res = mockResponse();

      let error;
      await teamController.createNewTeam(
        mockRequest(
          {
            name: 'random1',
            country: 'random2',
          },
          {},
          {},
          {
            user: {
              id: 'random3',
              roles: [{ name: 'REGULAR' }],
            },
          }
        ),
        res,
        (e) => (error = e)
      );

      assert.isUndefined(error);

      const teamToBeInserted = createTeamStub.getCall(0).args[0];

      assert.equal(teamToBeInserted.name, 'random1');
      assert.equal(teamToBeInserted.country, 'random2');
      assert.equal(teamToBeInserted.owner?.id, 'random3');
      assert.isUndefined(teamToBeInserted.players);
    });

    it('should return the correct response', async () => {
      const res = mockResponse();

      let error;
      await teamController.createNewTeam(
        mockRequest(
          {
            name: 'random1',
            country: 'random2',
          },
          {},
          {},
          {
            user: {
              id: 'random3',
              roles: [{ name: 'REGULAR' }],
            },
          }
        ),
        res,
        (e) => (error = e)
      );

      assert.isUndefined(error);
      assert.equal(res.status.getCall(0).args[0], 200);
      assert.equal(res.json.getCall(0).args[0].data.teamId, 'random');
    });
  });

  describe('fetchTeamById', () => {
    it('should call the team fetching service with correct params', async () => {
      const res = mockResponse();
      let error;
      await teamController.fetchTeamById(
        mockRequest(
          {},
          {
            teamId: 'random1',
          },
          {},
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

      const [params] = fetchTeamByIdStub.getCall(0).args;
      assert.equal(params.id, 'random1');
      assert.equal(params.ownerId, 'random2');
    });

    it('should return the correct response', async () => {
      const res = mockResponse();
      let error;
      await teamController.fetchTeamById(
        mockRequest(
          {},
          {
            teamId: 'random1',
          },
          {},
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
      assert.equal(res.json.getCall(0).args[0].data.id, 'random');
    });
  });

  describe('deleteTeam', () => {
    it('should call the team deleting service with correct params', async () => {
      const res = mockResponse();
      let error;
      await teamController.deleteTeamById(
        mockRequest(
          {},
          {
            teamId: 'random1',
          },
          {},
          {}
        ),
        res,
        (e) => (error = e)
      );

      assert.isUndefined(error);

      const [params] = deleteTeamStub.getCall(0).args;
      assert.equal(params.id, 'random');
    });

    it('should return the correct response', async () => {
      const res = mockResponse();
      let error;
      await teamController.deleteTeamById(
        mockRequest(
          {},
          {
            teamId: 'random1',
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
