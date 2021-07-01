import express from 'express';

import { validationService } from '../services';

export const validateRequestBody = (
  schemaType: validationService.SchemaTypes
): express.RequestHandler => {
  const validator: express.RequestHandler = async (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    try {
      validationService.validate(schemaType, req.body);
      next();
    } catch (e) {
      next(e);
    }
  };

  return validator;
};
