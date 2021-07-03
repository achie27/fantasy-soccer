import bcrypt from 'bcrypt';
import faker from 'faker';

import { countries } from '../constants';

export type AtLeastOne<T, U = { [K in keyof T]: Pick<T, K> }> = Partial<T> &
  U[keyof U];

export interface NumericOperators {
  lte?: number;
  gte?: number;
  lt?: number;
  gt?: number;
  eq?: number;
}

export const extractComparisonOperators = (
  map: Record<string, any>
): NumericOperators => {
  const operators: NumericOperators = {};
  if (map.lte) operators.lte = map.lte;

  if (map.gte) operators.gte = map.gte;

  if (map.lt) operators.lt = map.lt;

  if (map.gt) operators.gt = map.gt;

  if (map.eq) operators.eq = map.eq;

  return operators;
};

export const getRandInt = (l: number, r: number) => {
  l = Math.ceil(l);
  r = Math.floor(r);
  return Math.floor(Math.random() * (r - l + 1) + l);
};

export const generateRandomName = (type: 'first' | 'last' | 'full') => {
  if (type === 'first') {
    return faker.name.firstName();
  } else if (type === 'last') {
    return faker.name.lastName();
  } else {
    return faker.name.findName();
  }
};

export const getRandomCountry = () => {
  return countries[getRandInt(0, countries.length)].name;
};

export const hash = async (text: string): Promise<string> => {
  return await bcrypt.hash(text, 10);
};

export const compareWithHash = async (
  text: string,
  hashedText: string
): Promise<boolean> => {
  return await bcrypt.compare(text, hashedText);
};
