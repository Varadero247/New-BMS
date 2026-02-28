import {
  AssetRecord,
  AssetStatus,
  AssetCategory,
  ConditionRating,
  DepreciationMethod,
  DepreciationResult,
} from './types';

export class AssetRegistry {
  private _store = new Map<string, AssetRecord>();

  register(asset: Omit<AssetRecord, 'status' | 'condition'>): AssetRecord {
    const record: AssetRecord = {
      ...asset,
      status: 'PLANNING',
      condition: 'EXCELLENT',
    };
    this._store.set(asset.id, record);
    return { ...record };
  }

  acquire(id: string, date: string): AssetRecord {
    const asset = this._getOrThrow(id);
    asset.acquisitionDate = date;
    asset.status = 'ACQUIRED';
    return { ...asset };
  }

  putInService(id: string): AssetRecord {
    const asset = this._getOrThrow(id);
    asset.status = 'IN_SERVICE';
    return { ...asset };
  }

  sendForMaintenance(id: string): AssetRecord {
    const asset = this._getOrThrow(id);
    asset.status = 'UNDER_MAINTENANCE';
    return { ...asset };
  }

  retire(id: string): AssetRecord {
    const asset = this._getOrThrow(id);
    asset.status = 'RETIRED';
    return { ...asset };
  }

  dispose(id: string): AssetRecord {
    const asset = this._getOrThrow(id);
    asset.status = 'DISPOSED';
    return { ...asset };
  }

  updateCondition(id: string, condition: ConditionRating): AssetRecord {
    const asset = this._getOrThrow(id);
    asset.condition = condition;
    return { ...asset };
  }

  assign(id: string, assignedTo: string): AssetRecord {
    const asset = this._getOrThrow(id);
    asset.assignedTo = assignedTo;
    return { ...asset };
  }

  get(id: string): AssetRecord | undefined {
    const asset = this._store.get(id);
    return asset ? { ...asset } : undefined;
  }

  getAll(): AssetRecord[] {
    return Array.from(this._store.values()).map((a) => ({ ...a }));
  }

  getByStatus(status: AssetStatus): AssetRecord[] {
    return Array.from(this._store.values())
      .filter((a) => a.status === status)
      .map((a) => ({ ...a }));
  }

  getByCategory(category: AssetCategory): AssetRecord[] {
    return Array.from(this._store.values())
      .filter((a) => a.category === category)
      .map((a) => ({ ...a }));
  }

  getByLocation(location: string): AssetRecord[] {
    return Array.from(this._store.values())
      .filter((a) => a.location === location)
      .map((a) => ({ ...a }));
  }

  getByCondition(condition: ConditionRating): AssetRecord[] {
    return Array.from(this._store.values())
      .filter((a) => a.condition === condition)
      .map((a) => ({ ...a }));
  }

  getCriticalAssets(): AssetRecord[] {
    return Array.from(this._store.values())
      .filter((a) => a.condition === 'CRITICAL')
      .map((a) => ({ ...a }));
  }

  getCount(): number {
    return this._store.size;
  }

  calculateDepreciation(
    id: string,
    method: DepreciationMethod,
    asOfYear: number,
  ): DepreciationResult {
    const asset = this._getOrThrow(id);
    const { acquisitionCost, salvageValue, usefulLifeYears } = asset;

    const yearsElapsed = Math.max(0, Math.min(asOfYear, usefulLifeYears));

    let annualDepreciation = 0;
    let bookValue = acquisitionCost;
    let depreciationToDate = 0;

    if (method === 'STRAIGHT_LINE') {
      annualDepreciation = (acquisitionCost - salvageValue) / usefulLifeYears;
      depreciationToDate = annualDepreciation * yearsElapsed;
      bookValue = Math.max(salvageValue, acquisitionCost - depreciationToDate);
      depreciationToDate = acquisitionCost - bookValue;
    } else if (method === 'DECLINING_BALANCE') {
      const rate = 2 / usefulLifeYears;
      bookValue = Math.max(salvageValue, acquisitionCost * Math.pow(1 - rate, yearsElapsed));
      depreciationToDate = acquisitionCost - bookValue;
      // Annual depreciation is the depreciation in the last year
      if (yearsElapsed === 0) {
        annualDepreciation = acquisitionCost * rate;
      } else {
        const prevBookValue = Math.max(
          salvageValue,
          acquisitionCost * Math.pow(1 - rate, yearsElapsed - 1),
        );
        annualDepreciation = prevBookValue - bookValue;
      }
    } else {
      // UNITS_OF_PRODUCTION — treat same as straight-line for default
      annualDepreciation = (acquisitionCost - salvageValue) / usefulLifeYears;
      depreciationToDate = annualDepreciation * yearsElapsed;
      bookValue = Math.max(salvageValue, acquisitionCost - depreciationToDate);
      depreciationToDate = acquisitionCost - bookValue;
    }

    return {
      assetId: id,
      method,
      annualDepreciation,
      bookValue,
      depreciationToDate,
      yearsElapsed,
    };
  }

  private _getOrThrow(id: string): AssetRecord {
    const asset = this._store.get(id);
    if (!asset) throw new Error(`Asset not found: ${id}`);
    return asset;
  }
}
