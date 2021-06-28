import { Router } from "express";
import { userController, authController } from "../controllers";

const userRouter = Router();

userRouter.post("/", authController.verifyRole(['ADMIN']), userController.createNewUser);
userRouter.get("/", authController.verifyRole(['ADMIN', 'REGULAR']), userController.fetchUsers);
userRouter.get("/:userId", authController.verifyRole(['ADMIN', 'REGULAR']), userController.fetchUserById);
userRouter.put("/:userId", authController.verifyRole(['ADMIN', 'REGULAR']), userController.updateUserById);
userRouter.delete("/:userId", authController.verifyRole(['ADMIN']), userController.deleteUserById);

userRouter.use('*', (_, res) => {
  return res.status(405).end();
});

export default userRouter;