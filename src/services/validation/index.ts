import Ajv from 'ajv';

import * as schemas from './schemas';
import { InvalidInput } from '../../lib/exceptions';

export type SchemaTypes = keyof typeof schemas;

const ajv = new Ajv();

const compiledSchemas: Record<SchemaTypes, Ajv.ValidateFunction> = {} as Record<
  SchemaTypes,
  Ajv.ValidateFunction
>;
Object.keys(schemas).forEach(
  (s) => (compiledSchemas[s] = ajv.compile(schemas[s]))
);

export const validate = (
  schemaType: SchemaTypes,
  data: Record<string, any>
) => {
  const isValid = compiledSchemas[schemaType](data);
  if (!isValid) {
    throw new InvalidInput(compiledSchemas[schemaType].errors[0].message);
  }
};
