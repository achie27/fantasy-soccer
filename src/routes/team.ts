import { Router } from "express";
import { teamController, authController } from "../controllers";

const teamRouter = Router();

teamRouter.post("/", authController.verifyRole(['ADMIN', 'REGULAR']), teamController.createNewTeam);
teamRouter.get("/", authController.verifyRole(['ADMIN', 'REGULAR']), teamController.fetchTeams);
teamRouter.get("/:teamId", authController.verifyRole(['ADMIN', 'REGULAR']), teamController.fetchTeamById);
teamRouter.put("/:teamId", authController.verifyRole(['ADMIN', 'REGULAR']), teamController.updateTeamById);
teamRouter.delete("/:teamId", authController.verifyRole(['ADMIN']), teamController.deleteTeamById);

teamRouter.use('*', (_, res) => {
  return res.status(405).end();
});

export default teamRouter;