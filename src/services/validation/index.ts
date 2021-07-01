import Ajv from 'ajv';

import * as schemas from './schemas';
import { InvalidInput } from '../../lib/exceptions';

const ajv = new Ajv();

const compiledSchemas: Record<keyof typeof schemas, Ajv.ValidateFunction> =
  {} as Record<keyof typeof schemas, Ajv.ValidateFunction>;
Object.keys(schemas).forEach(
  (s) => (compiledSchemas[s] = ajv.compile(schemas[s]))
);

export const validate = (
  schemaType: keyof typeof schemas,
  object: Record<string, any>
) => {
  const isValid = compiledSchemas[schemaType](object);
  if (!isValid) {
    throw new InvalidInput(compiledSchemas[schemaType].errors[0].message);
  }
};
