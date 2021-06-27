import express from "express";
import helmet from "helmet";
import cors from "cors";
import bp from "body-parser";
import mongoose from "mongoose";
import morgan from "morgan";

import { serverPort, dbUri } from "./config";
import { authRouter, userRouter, teamRouter, playerRouter, transferRouter } from "./routes";

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

const server = app.listen(serverPort, async () => {
  try {
    console.log("Server running");
    await mongoose.connect(dbUri);
    mongoose.set("debug", true);
  } catch (e) {
    console.error(e);
    console.log("Shutting down the app");

    server.close();
    process.exit(1);
  }
});

process.on("uncaughtException", (err) => {
  console.error(err);
});

process.on("unhandledRejection", (err) => {
  console.error(err);
});