import { Router } from "express";
import { authController } from "../controllers";

const authRouter = Router();

authRouter.post("/register", authController.register);
authRouter.post("/token/new", authController.generateNewToken);
// authRouter.post("/token/refresh", authController.refreshToken);

export default authRouter;