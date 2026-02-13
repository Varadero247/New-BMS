/**
 * Straight-line depreciation: equal annual depreciation over the asset's useful life.
 * @param cost - Original cost of the asset
 * @param salvage - Salvage value at end of useful life
 * @param life - Useful life in years
 * @returns Annual depreciation amount
 */
export function straightLine(cost: number, salvage: number, life: number): number {
  if (life <= 0) throw new Error('Life must be greater than 0');
  if (cost < 0) throw new Error('Cost must be non-negative');
  if (salvage < 0) throw new Error('Salvage must be non-negative');
  if (salvage > cost) throw new Error('Salvage cannot exceed cost');
  return (cost - salvage) / life;
}

/**
 * Reducing (declining) balance depreciation for a specific year.
 * @param cost - Original cost of the asset
 * @param salvage - Salvage value at end of useful life
 * @param life - Useful life in years
 * @param year - The year to calculate depreciation for (1-based)
 * @returns Depreciation amount for the specified year
 */
export function reducingBalance(cost: number, salvage: number, life: number, year: number): number {
  if (life <= 0) throw new Error('Life must be greater than 0');
  if (year < 1 || year > life) throw new Error('Year must be between 1 and life');
  if (cost < 0) throw new Error('Cost must be non-negative');
  if (salvage < 0) throw new Error('Salvage must be non-negative');
  if (salvage > cost) throw new Error('Salvage cannot exceed cost');

  const rate = 1 - Math.pow(salvage / cost, 1 / life);
  let bookValue = cost;
  for (let i = 1; i < year; i++) {
    bookValue -= bookValue * rate;
  }
  return bookValue * rate;
}

/**
 * Sum-of-the-years'-digits depreciation for a specific year.
 * @param cost - Original cost of the asset
 * @param salvage - Salvage value at end of useful life
 * @param life - Useful life in years
 * @param year - The year to calculate depreciation for (1-based)
 * @returns Depreciation amount for the specified year
 */
export function sumOfDigits(cost: number, salvage: number, life: number, year: number): number {
  if (life <= 0) throw new Error('Life must be greater than 0');
  if (year < 1 || year > life) throw new Error('Year must be between 1 and life');
  if (cost < 0) throw new Error('Cost must be non-negative');
  if (salvage < 0) throw new Error('Salvage must be non-negative');
  if (salvage > cost) throw new Error('Salvage cannot exceed cost');

  const sumOfYears = (life * (life + 1)) / 2;
  const remainingLife = life - year + 1;
  return ((cost - salvage) * remainingLife) / sumOfYears;
}

/**
 * Units-of-production depreciation.
 * @param cost - Original cost of the asset
 * @param salvage - Salvage value at end of useful life
 * @param totalUnits - Total estimated units the asset will produce
 * @param unitsThisPeriod - Units produced in the current period
 * @returns Depreciation amount for the period
 */
export function unitsOfProduction(
  cost: number,
  salvage: number,
  totalUnits: number,
  unitsThisPeriod: number,
): number {
  if (totalUnits <= 0) throw new Error('Total units must be greater than 0');
  if (unitsThisPeriod < 0) throw new Error('Units this period must be non-negative');
  if (cost < 0) throw new Error('Cost must be non-negative');
  if (salvage < 0) throw new Error('Salvage must be non-negative');
  if (salvage > cost) throw new Error('Salvage cannot exceed cost');

  const depreciationPerUnit = (cost - salvage) / totalUnits;
  return depreciationPerUnit * unitsThisPeriod;
}
