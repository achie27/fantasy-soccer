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
const createTransferStub = sinon.stub().resolves({ id: 'random' });
const fetchTransfersStub = sinon.stub().resolves([{ id: 'random' }]);
const fetchTransferByIdStub = sinon.stub().resolves({ id: 'random' });
const updateTransferByIdStub = sinon.stub().resolves();
const deleteTransferStub = sinon.stub().resolves();

const transferController = pq('../src/controllers/transfer', {
  '../services': {
    transferService: {
      createTransfer: createTransferStub,
      fetchTransfers: fetchTransfersStub,
      fetchTransferById: fetchTransferByIdStub,
      updateTransferById: updateTransferByIdStub,
      deleteTransfer: deleteTransferStub,
    },
  },
});

describe('Transfer controllers >', () => {
  beforeEach(() => {
    createTransferStub.reset();
    createTransferStub.resolves({ id: 'random' });

    fetchTransfersStub.reset();
    fetchTransfersStub.resolves([{ id: 'random' }]);

    fetchTransferByIdStub.reset();
    fetchTransferByIdStub.resolves({ id: 'random' });

    updateTransferByIdStub.reset();
    updateTransferByIdStub.resolves();

    deleteTransferStub.reset();
    deleteTransferStub.resolves();
  });

  describe('createNewTransfer >', () => {
    it('should call the Transfer service with correct params', async () => {
      const res = mockResponse();

      let error;
      await transferController.createNewTransfer(
        mockRequest(
          {
            player: {
              id: 'random1',
            },
            initiatorTeam: {
              id: 'random2',
            },
            buyNowPrice: 'random3',
          },
          {},
          {},
          {
            user: {
              id: 'random0',
              roles: [{ name: 'ADMIN' }],
            },
          }
        ),
        res,
        (e) => (error = e)
      );

      assert.isUndefined(error);

      const transfer = createTransferStub.getCall(0).args[0];

      assert.equal(transfer.player?.id, 'random1');
      assert.equal(transfer.initiatorTeam?.id, 'random2');
      assert.equal(transfer.initiatorTeam?.ownerId, 'random0');
      assert.equal(transfer.buyNowPrice, 'random3');
    });

    it('should return the correct response', async () => {
      const res = mockResponse();

      let error;
      await transferController.createNewTransfer(
        mockRequest(
          {
            player: {
              id: 'random1',
            },
            initiatorTeam: {
              id: 'random2',
            },
            buyNowPrice: 'random3',
          },
          {},
          {},
          {
            user: {
              id: 'random0',
              roles: [{ name: 'ADMIN' }],
            },
          }
        ),
        res,
        (e) => (error = e)
      );

      assert.isUndefined(error);
      assert.equal(res.status.getCall(0).args[0], 200);
      assert.equal(res.json.getCall(0).args[0].data.transferId, 'random');
    });
  });

  describe('fetchTransferById', () => {
    it('should call the Transfer fetching service with correct params', async () => {
      const res = mockResponse();
      let error;
      await transferController.fetchTransferById(
        mockRequest(
          {},
          {
            transferId: 'random1',
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

      const [params] = fetchTransferByIdStub.getCall(0).args;
      assert.equal(params.id, 'random1');
    });

    it('should return the correct response', async () => {
      const res = mockResponse();
      let error;
      await transferController.fetchTransferById(
        mockRequest(
          {},
          {
            transferId: 'random1',
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

  describe('deleteTransfer', () => {
    it('should call the Transfer deleting service with correct params', async () => {
      const res = mockResponse();
      let error;
      await transferController.deleteTransferById(
        mockRequest(
          {},
          {
            transferId: 'random1',
          },
          {},
          {
            user: {
              id: 'random2',
              roles: [{ name: 'ADMIN' }],
            },
          }
        ),
        res,
        (e) => (error = e)
      );

      assert.isUndefined(error);

      const [params] = deleteTransferStub.getCall(0).args;
      assert.equal(params.id, 'random');
      assert.isUndefined(params.ownerId);
    });

    it('should return the correct response', async () => {
      const res = mockResponse();
      let error;
      await transferController.deleteTransferById(
        mockRequest(
          {},
          {
            transferId: 'random1',
          },
          {},
          {
            user: {
              id: 'random2',
              roles: [{ name: 'ADMIN' }],
            },
          }
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
