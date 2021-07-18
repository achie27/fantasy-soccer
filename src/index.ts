import fs from 'fs';
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import mongoose from 'mongoose';
import morgan from 'morgan';
import cp from 'cookie-parser';

import { serverPort, dbUri, dbTLS, dbCert } from './config';
import {
  authRouter,
  userRouter,
  teamRouter,
  playerRouter,
  transferRouter,
} from './routes';

import logger from './lib/logger';
import { isContextualError } from './lib/exceptions';

const app = express();

app.use(helmet());
app.use(cors()); // TODO; add whitelist
app.use(cp());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(morgan('dev'));

app.use('/api/v1/auth', authRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/teams', teamRouter);
app.use('/api/v1/players', playerRouter);
app.use('/api/v1/transfers', transferRouter);

app.use('*', (req, res) => {
  return res.status(404).json({});
});

app.use((err, req, res, next) => {
  if (isContextualError(err)) {
    const errorCtx = err.getContext();
    logger.error(errorCtx);

    return res
      .status(errorCtx.httpResponseCode)
      .json({ code: errorCtx.code, description: errorCtx.message });
  } else {
    logger.error(err);
    return res.status(500).json({ error: 'INTERNAL_SERVER_ERROR' });
  }
});

(async () => {
  let server;

  try {
    const options: Record<string, any> = {};
    if (dbTLS) {
      fs.writeFileSync('./mongo.crt', dbCert);
      options.tls = true;
      options.tlsCAFile = './mongo.crt'
    }
    
    await mongoose.connect(dbUri, options);
    mongoose.set('debug', true);

    server = app.listen(serverPort);
    logger.log('Server running');
  } catch (e) {
    logger.error(e);
    logger.log('Shutting down the app');

    server && server.close();
    process.exit(1);
  }
})();

process.on('uncaughtException', (err) => {
  logger.error(err);
});

process.on('unhandledRejection', (err) => {
  logger.error(err);
});
