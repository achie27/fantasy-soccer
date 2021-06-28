import express from 'express';

export const validateRequestBody = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {

  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "INTERNAL_SERVER_ERROR" });
  }
};