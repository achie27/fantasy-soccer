import express from 'express';

import { validationService, utilityService } from '../services';

export const validateRequestBody = (
  schemaType: string
): express.RequestHandler => {
  const validator: express.RequestHandler = async (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    try {
      const { err } = await validationService.validate(schemaType, req.body);
      if (err) {
        console.error(err);
        return res.status(400).json({ error: 'INCORRECT_REQUEST_BODY' });
      }

      next();
    } catch (e) {
      console.error(e);
      return res.status(500).json({ error: 'INTERNAL_SERVER_ERROR' });
    }
  };

  return validator;
};
