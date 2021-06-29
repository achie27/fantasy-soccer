import { Router } from "express";
import {
  transferController,
  authController,
  validationController,
} from "../controllers";

const transferRouter = Router();
transferRouter.use(authController.populateUserContext);

transferRouter.post(
  "/",
  authController.verifyRole(["ADMIN", "REGULAR"]),
  validationController.validateRequestBody("createNewTransfer"),
  transferController.createNewTransfer
);
transferRouter.post(
  "/:transferId/buyPlayerNow",
  authController.verifyRole(["ADMIN", "REGULAR"]),
  transferController.buyPlayerNow
);
transferRouter.get(
  "/",
  authController.verifyRole(["ADMIN", "REGULAR"]),
  transferController.fetchTransfers
);
transferRouter.get(
  "/:transferId",
  authController.verifyRole(["ADMIN", "REGULAR"]),
  transferController.fetchTransferById
);
transferRouter.put(
  "/:transferId",
  authController.verifyRole(["ADMIN", "REGULAR"]),
  validationController.validateRequestBody("updateTransferById"),
  transferController.updateTransferById
);
transferRouter.delete(
  "/:transferId",
  authController.verifyRole(["ADMIN", "REGULAR"]),
  transferController.deleteTransferById
);

transferRouter.use("*", (_, res) => {
  return res.status(405).end();
});

export default transferRouter;
