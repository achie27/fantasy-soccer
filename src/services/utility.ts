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
