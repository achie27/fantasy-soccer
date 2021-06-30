import { Router } from 'express';
import {
  playerController,
  authController,
  validationController,
} from '../controllers';

const playerRouter = Router();
playerRouter.use(authController.populateUserContext);

playerRouter.post(
  '/',
  authController.verifyRole(['ADMIN']),
  validationController.validateRequestBody('createNewPlayer'),
  playerController.createNewPlayer
);
playerRouter.get(
  '/',
  authController.verifyRole(['ADMIN', 'REGULAR']),
  playerController.fetchPlayers
);
playerRouter.get(
  '/:playerId',
  authController.verifyRole(['ADMIN', 'REGULAR']),
  playerController.fetchPlayerById
);
playerRouter.put(
  '/:playerId',
  authController.verifyRole(['ADMIN', 'REGULAR']),
  validationController.validateRequestBody('updatePlayerById'),
  playerController.updatePlayerById
);
playerRouter.delete(
  '/:playerId',
  authController.verifyRole(['ADMIN']),
  playerController.deletePlayerById
);

playerRouter.use('*', (_, res) => {
  return res.status(405).end();
});

export default playerRouter;
