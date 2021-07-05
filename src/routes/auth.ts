import { Router } from 'express';
import { authController, validationController } from '../controllers';

const authRouter = Router();

authRouter.post(
  '/register',
  validationController.validateRequestBody('registerUser'),
  authController.registerUser
);
authRouter.post(
  '/token/new',
  validationController.validateRequestBody('generateNewToken'),
  authController.generateNewToken
);

authRouter.post(
  '/token/refresh',
  authController.populateUserContext,
  authController.refreshToken
);

export default authRouter;
