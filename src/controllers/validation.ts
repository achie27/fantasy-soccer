import express from 'express';

import { validationService } from '../services';

export const validateRequestBody = (
  schemaType: string
): express.RequestHandler => {
  const validator: express.RequestHandler = async (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    try {
      await validationService.validate(schemaType, req.body);
      next();
    } catch (e) {
      next(e);
    }
  };

  return validator;
};
