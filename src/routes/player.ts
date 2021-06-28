import { Router } from "express";
import { playerController, authController } from "../controllers";

const playerRouter = Router();

playerRouter.post("/", authController.verifyRole(['ADMIN']), playerController.createNewPlayer);
playerRouter.get("/", authController.verifyRole(['ADMIN', 'REGULAR']), playerController.fetchPlayers);
playerRouter.get("/:playerId", authController.verifyRole(['ADMIN', 'REGULAR']), playerController.fetchPlayerById);
playerRouter.put("/:playerId", authController.verifyRole(['ADMIN', 'REGULAR']), playerController.updatePlayerById);
playerRouter.delete("/:playerId", authController.verifyRole(['ADMIN', 'REGULAR']), playerController.deletePlayerById);

playerRouter.use('*', (_, res) => {
  return res.status(405).end();
});

export default playerRouter;