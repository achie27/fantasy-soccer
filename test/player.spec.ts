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
const createPlayerStub = sinon.stub().resolves({ id: 'random' });
const fetchPlayersStub = sinon.stub().resolves([{ id: 'random' }]);
const fetchPlayerByIdStub = sinon.stub().resolves({ id: 'random' });
const updatePlayerStub = sinon.stub().resolves();
const deletePlayerStub = sinon.stub().resolves();

const playerController = pq('../src/controllers/player', {
  '../services': {
    playerService: {
      createPlayer: createPlayerStub,
      fetchPlayers: fetchPlayersStub,
      fetchPlayerById: fetchPlayerByIdStub,
      updatePlayer: updatePlayerStub,
      deletePlayer: deletePlayerStub,
    },
  },
});

describe('Player controllers >', () => {
  beforeEach(() => {
    createPlayerStub.reset();
    createPlayerStub.resolves({ id: 'random' });

    fetchPlayersStub.reset();
    fetchPlayersStub.resolves([{ id: 'random' }]);

    fetchPlayerByIdStub.reset();
    fetchPlayerByIdStub.resolves({ id: 'random' });

    updatePlayerStub.reset();
    updatePlayerStub.resolves();

    deletePlayerStub.reset();
    deletePlayerStub.resolves();
  });

  describe('createNewPlayer >', () => {
    it('should call the Player service with correct params', async () => {
      const res = mockResponse();

      let error;
      await playerController.createNewPlayer(
        mockRequest(
          {
            firstName: 'random1',
            lastName: 'random2',
            type: 'random3',
            country: 'random4',
            birthdate: 'random5',
          },
          {},
          {},
          {
            user: {
              id: 'random0',
              roles: [{ name: 'REGULAR' }],
            },
          }
        ),
        res,
        (e) => (error = e)
      );

      assert.isUndefined(error);

      const playerToBeInserted = createPlayerStub.getCall(0).args[0];

      assert.equal(playerToBeInserted.firstName, 'random1');
      assert.equal(playerToBeInserted.lastName, 'random2');
      assert.equal(playerToBeInserted.type, 'random3');
      assert.equal(playerToBeInserted.country, 'random4');
      assert.equal(playerToBeInserted.birthdate, 'random5');
      assert.isUndefined(playerToBeInserted.team?.id);
    });

    it('should return the correct response', async () => {
      const res = mockResponse();

      let error;
      await playerController.createNewPlayer(
        mockRequest(
          {
            firstName: 'random1',
            lastName: 'random2',
            type: 'random3',
            country: 'random4',
            birthdate: 'random5',
          },
          {},
          {},
          {
            user: {
              id: 'random0',
              roles: [{ name: 'REGULAR' }],
            },
          }
        ),
        res,
        (e) => (error = e)
      );

      assert.isUndefined(error);
      assert.equal(res.status.getCall(0).args[0], 200);
      assert.equal(res.json.getCall(0).args[0].data.playerId, 'random');
    });
  });

  describe('fetchPlayerById', () => {
    it('should call the Player fetching service with correct params', async () => {
      const res = mockResponse();
      let error;
      await playerController.fetchPlayerById(
        mockRequest(
          {},
          {
            playerId: 'random1',
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

      const [params] = fetchPlayerByIdStub.getCall(0).args;
      assert.equal(params.id, 'random1');
      assert.equal(params.ownerId, 'random2');
    });

    it('should return the correct response', async () => {
      const res = mockResponse();
      let error;
      await playerController.fetchPlayerById(
        mockRequest(
          {},
          {
            playerId: 'random1',
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

  describe('deletePlayer', () => {
    it('should call the Player deleting service with correct params', async () => {
      const res = mockResponse();
      let error;
      await playerController.deletePlayerById(
        mockRequest(
          {},
          {
            playerId: 'random1',
          },
          {},
          {}
        ),
        res,
        (e) => (error = e)
      );

      assert.isUndefined(error);

      const [params] = deletePlayerStub.getCall(0).args;
      assert.equal(params.id, 'random');
    });

    it('should return the correct response', async () => {
      const res = mockResponse();
      let error;
      await playerController.deletePlayerById(
        mockRequest(
          {},
          {
            playerId: 'random1',
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
