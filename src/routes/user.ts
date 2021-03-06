import { Router } from 'express';
import {
  userController,
  authController,
  validationController,
} from '../controllers';

const userRouter = Router();
userRouter.use(authController.populateUserContext);

userRouter.post(
  '/',
  authController.verifyRole(['ADMIN']),
  validationController.validateRequestBody('createNewUser'),
  userController.createNewUser
);
userRouter.get(
  '/',
  authController.verifyRole(['ADMIN', 'REGULAR']),
  userController.fetchUsers
);
userRouter.get(
  '/:userId',
  authController.verifyRole(['ADMIN', 'REGULAR']),
  userController.fetchUserById
);
userRouter.put(
  '/:userId',
  authController.verifyRole(['ADMIN', 'REGULAR']),
  validationController.validateRequestBody('updateUserById'),
  userController.updateUserById
);
userRouter.delete(
  '/:userId',
  authController.verifyRole(['ADMIN']),
  userController.deleteUserById
);

export default userRouter;
