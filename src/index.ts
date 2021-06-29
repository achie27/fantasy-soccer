import express from "express";
import helmet from "helmet";
import cors from "cors";
import bp from "body-parser";
import mongoose from "mongoose";
import morgan from "morgan";

import { serverPort, dbUri } from "./config";
import {
  authRouter,
  userRouter,
  teamRouter,
  playerRouter,
  transferRouter,
} from "./routes";

import logger from './lib/logger';
import { isContextualError } from './lib/exceptions';

const app = express();

app.use(helmet());
app.use(cors()); // TODO; add whitelist
app.use(bp.urlencoded({ extended: false }));
app.use(bp.json());
app.use(morgan("dev"));

app.use("/api/v1/auth", authRouter);
app.use("/api/v1/users", userRouter);
app.use("/api/v1/teams", teamRouter);
app.use("/api/v1/players", playerRouter);
app.use("/api/v1/transfers", transferRouter);

app.use("*", (req, res) => {
  return res.status(404).json({});
});

app.use((err, req, res, next) => {
  if(isContextualError(err)) {
    const errorCtx = err.getContext();
    logger.error(errorCtx);

    return res.status(errorCtx.httpResponseCode).json({ code: errorCtx.code, description: errorCtx.message });
  } else {
    logger.error(err);
    return res.status(500).json({ error: "INTERNAL_SERVER_ERROR" });
  }
});

const server = app.listen(serverPort, async () => {
  try {
    logger.log("Server running");
    await mongoose.connect(dbUri);
    mongoose.set("debug", true);
  } catch (e) {
    logger.error(e);
    logger.log("Shutting down the app");

    server.close();
    process.exit(1);
  }
});

process.on("uncaughtException", (err) => {
  logger.error(err);
});

process.on("unhandledRejection", (err) => {
  logger.error(err);
});
