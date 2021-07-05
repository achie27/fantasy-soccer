import Ajv, { ValidateFunction } from 'ajv';
import addFormats from 'ajv-formats';

import { InvalidInput } from '../../lib/exceptions';
import logger from '../../lib/logger';
import { countries } from '../../constants';

import * as schemas from './schemas';
import { teamModel, userModel, transferModel, playerModel } from '../../models';

export type SchemaTypes = keyof typeof schemas;

const ajv = new Ajv();
addFormats(ajv);

ajv.addKeyword({
  async: true,
  keyword: 'validTeamId',
  type: 'string',
  schemaType: 'boolean',
  async validate(schema, data) {
    return await teamModel.doesTeamExist(data);
  },
});

ajv.addKeyword({
  async: true,
  keyword: 'validUserId',
  type: 'string',
  schemaType: 'boolean',
  async validate(schema, data) {
    return await userModel.doesUserExist(data);
  },
});

ajv.addKeyword({
  async: true,
  keyword: 'validTransferId',
  type: 'string',
  schemaType: 'boolean',
  async validate(schema, data) {
    return await transferModel.doesTransferExist(data);
  },
});

ajv.addKeyword({
  async: true,
  keyword: 'validPlayerId',
  type: 'string',
  schemaType: 'boolean',
  async validate(schema, data) {
    console.log(data);
    return await playerModel.doesPlayerExist(data);
  },
});

ajv.addKeyword({
  keyword: 'validCountry',
  type: 'string',
  schemaType: 'boolean',
  validate(schema, data) {
    return countries.map((c) => c.name).includes(data);
  },
});

const compiledSchemas: Record<SchemaTypes, ValidateFunction> = {} as Record<
  SchemaTypes,
  ValidateFunction
>;
Object.keys(schemas).forEach(
  (s) => (compiledSchemas[s] = ajv.compile(schemas[s]))
);

export const validate = async (
  schemaType: SchemaTypes,
  data: Record<string, any>
) => {
  try {
    const isValid = await compiledSchemas[schemaType](data);
    if (!isValid) {
      const err = compiledSchemas[schemaType].errors[0];
      throw new InvalidInput(`${err.instancePath}: ${err.message}`);
    }
  } catch (e) {
    if (!(e instanceof Ajv.ValidationError)) throw e;

    logger.error(e);

    const err = e.errors[0];
    throw new InvalidInput(`${err.instancePath}: ${err.message}`);
  }
};
