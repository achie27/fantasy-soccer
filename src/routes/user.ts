import { Router } from "express";
import {
  userController,
  authController,
  validationController,
} from "../controllers";

const userRouter = Router();

userRouter.post(
  "/",
  authController.verifyRole(["ADMIN"]),
  validationController.validateRequestBody("createNewUser"),
  userController.createNewUser
);
userRouter.get(
  "/",
  authController.verifyRole(["ADMIN", "REGULAR"]),
  validationController.validateRequestBody("fetchUsers"),
  userController.fetchUsers
);
userRouter.get(
  "/:userId",
  authController.verifyRole(["ADMIN", "REGULAR"]),
  validationController.validateRequestBody("fetchUserById"),
  userController.fetchUserById
);
userRouter.put(
  "/:userId",
  authController.verifyRole(["ADMIN", "REGULAR"]),
  validationController.validateRequestBody("updateUserById"),
  userController.updateUserById
);
userRouter.delete(
  "/:userId",
  authController.verifyRole(["ADMIN"]),
  validationController.validateRequestBody("deleteUserById"),
  userController.deleteUserById
);

userRouter.use("*", (_, res) => {
  return res.status(405).end();
});

export default userRouter;
