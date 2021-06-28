import { Router } from "express";
import { transferController, authController } from "../controllers";

const transferRouter = Router();

transferRouter.post("/", authController.verifyRole(['ADMIN', 'REGULAR']), transferController.createNewTransfer);
transferRouter.post("/:transferId/buyPlayerNow", authController.verifyRole(['ADMIN', 'REGULAR']), transferController.createNewTransfer);
transferRouter.get("/", authController.verifyRole(['ADMIN', 'REGULAR']), transferController.fetchTransfers);
transferRouter.get("/:transferId", authController.verifyRole(['ADMIN', 'REGULAR']), transferController.fetchTransferById);
transferRouter.put("/:transferId", authController.verifyRole(['ADMIN', 'REGULAR']), transferController.updateTransferById);
transferRouter.delete("/:transferId", authController.verifyRole(['ADMIN', 'REGULAR']), transferController.deleteTransferById);

transferRouter.use('*', (_, res) => {
  return res.status(405).end();
});

export default transferRouter;