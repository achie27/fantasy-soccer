import { Router } from 'express';
import {
  transferController,
  authController,
  validationController,
} from '../controllers';

const transferRouter = Router();
transferRouter.use(authController.populateUserContext);

transferRouter.post(
  '/',
  authController.verifyRole(['ADMIN', 'REGULAR']),
  validationController.validateRequestBody('createNewTransfer'),
  transferController.createNewTransfer
);
transferRouter.post(
  '/:transferId/buyPlayerNow',
  authController.verifyRole(['ADMIN', 'REGULAR']),
  validationController.validateRequestBody('buyPlayerNow'),
  transferController.buyPlayerNow
);
transferRouter.get(
  '/',
  authController.verifyRole(['ADMIN', 'REGULAR']),
  transferController.fetchTransfers
);
transferRouter.get(
  '/:transferId',
  authController.verifyRole(['ADMIN', 'REGULAR']),
  transferController.fetchTransferById
);
transferRouter.put(
  '/:transferId',
  authController.verifyRole(['ADMIN', 'REGULAR']),
  validationController.validateRequestBody('updateTransferById'),
  transferController.updateTransferById
);
transferRouter.delete(
  '/:transferId',
  authController.verifyRole(['ADMIN', 'REGULAR']),
  transferController.deleteTransferById
);

export default transferRouter;
