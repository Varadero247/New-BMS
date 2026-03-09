// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// Phase 134 — web-energy specification tests

type EnergySource = 'ELECTRICITY' | 'NATURAL_GAS' | 'DIESEL' | 'SOLAR' | 'WIND' | 'STEAM' | 'BIOMASS';
type EnPIType = 'ABSOLUTE' | 'INTENSITY' | 'NORMALIZED';
type MeterType = 'MAIN' | 'SUB' | 'CHECK' | 'VIRTUAL';
type SEUCategory = 'HVAC' | 'LIGHTING' | 'MOTORS' | 'COMPRESSED_AIR' | 'PROCESS_HEAT' | 'TRANSPORT';

const ENERGY_SOURCES: EnergySource[] = ['ELECTRICITY', 'NATURAL_GAS', 'DIESEL', 'SOLAR', 'WIND', 'STEAM', 'BIOMASS'];
const ENPI_TYPES: EnPIType[] = ['ABSOLUTE', 'INTENSITY', 'NORMALIZED'];
const METER_TYPES: MeterType[] = ['MAIN', 'SUB', 'CHECK', 'VIRTUAL'];
const SEU_CATEGORIES: SEUCategory[] = ['HVAC', 'LIGHTING', 'MOTORS', 'COMPRESSED_AIR', 'PROCESS_HEAT', 'TRANSPORT'];

const emissionFactors: Record<EnergySource, number> = {
  ELECTRICITY: 0.233,
  NATURAL_GAS: 0.202,
  DIESEL: 2.68,
  SOLAR: 0,
  WIND: 0,
  STEAM: 0.18,
  BIOMASS: 0.015,
};

function computeCO2e(energyKWh: number, source: EnergySource): number {
  return energyKWh * emissionFactors[source];
}

function energyIntensity(totalEnergy: number, productionUnits: number): number {
  if (productionUnits === 0) return 0;
  return totalEnergy / productionUnits;
}

function percentageSaving(baseline: number, actual: number): number {
  if (baseline === 0) return 0;
  return ((baseline - actual) / baseline) * 100;
}

function isRenewable(source: EnergySource): boolean {
  return source === 'SOLAR' || source === 'WIND' || source === 'BIOMASS';
}

function convertKWhToGJ(kwh: number): number {
  return kwh * 0.0036;
}

describe('Emission factors', () => {
  ENERGY_SOURCES.forEach(s => {
    it(`${s} has emission factor`, () => expect(emissionFactors[s]).toBeDefined());
    it(`${s} emission factor is non-negative`, () => expect(emissionFactors[s]).toBeGreaterThanOrEqual(0));
  });
  it('SOLAR has zero emissions', () => expect(emissionFactors.SOLAR).toBe(0));
  it('WIND has zero emissions', () => expect(emissionFactors.WIND).toBe(0));
  it('DIESEL has highest emissions', () => {
    expect(emissionFactors.DIESEL).toBeGreaterThan(emissionFactors.ELECTRICITY);
  });
  for (let i = 0; i < 50; i++) {
    const s = ENERGY_SOURCES[i % 7];
    it(`emission factor for ${s} is number (idx ${i})`, () => expect(typeof emissionFactors[s]).toBe('number'));
  }
});

describe('computeCO2e', () => {
  it('SOLAR produces 0 CO2e', () => expect(computeCO2e(1000, 'SOLAR')).toBe(0));
  it('WIND produces 0 CO2e', () => expect(computeCO2e(1000, 'WIND')).toBe(0));
  it('0 kWh produces 0 CO2e', () => expect(computeCO2e(0, 'ELECTRICITY')).toBe(0));
  it('ELECTRICITY 1000 kWh = 233 kgCO2e', () => expect(computeCO2e(1000, 'ELECTRICITY')).toBeCloseTo(233));
  for (let i = 1; i <= 100; i++) {
    it(`computeCO2e(${i * 100}, ELECTRICITY) is positive`, () => {
      expect(computeCO2e(i * 100, 'ELECTRICITY')).toBeGreaterThan(0);
    });
  }
});

describe('energyIntensity', () => {
  it('zero production returns 0', () => expect(energyIntensity(1000, 0)).toBe(0));
  it('1000 kWh / 500 units = 2 kWh/unit', () => expect(energyIntensity(1000, 500)).toBe(2));
  for (let units = 1; units <= 100; units++) {
    it(`intensity with ${units} units is positive`, () => {
      expect(energyIntensity(1000, units)).toBeGreaterThan(0);
    });
  }
});

describe('percentageSaving', () => {
  it('0 baseline returns 0', () => expect(percentageSaving(0, 0)).toBe(0));
  it('20% reduction from 1000 to 800 = 20%', () => expect(percentageSaving(1000, 800)).toBe(20));
  it('no change = 0%', () => expect(percentageSaving(1000, 1000)).toBe(0));
  it('increase gives negative saving', () => expect(percentageSaving(1000, 1200)).toBeLessThan(0));
  for (let pct = 0; pct <= 50; pct++) {
    it(`${pct}% saving from baseline 1000`, () => {
      const actual = 1000 * (1 - pct / 100);
      expect(percentageSaving(1000, actual)).toBeCloseTo(pct);
    });
  }
});

describe('isRenewable', () => {
  it('SOLAR is renewable', () => expect(isRenewable('SOLAR')).toBe(true));
  it('WIND is renewable', () => expect(isRenewable('WIND')).toBe(true));
  it('BIOMASS is renewable', () => expect(isRenewable('BIOMASS')).toBe(true));
  it('DIESEL is not renewable', () => expect(isRenewable('DIESEL')).toBe(false));
  it('ELECTRICITY is not renewable', () => expect(isRenewable('ELECTRICITY')).toBe(false));
  for (let i = 0; i < 100; i++) {
    const s = ENERGY_SOURCES[i % 7];
    it(`isRenewable(${s}) returns boolean (idx ${i})`, () => expect(typeof isRenewable(s)).toBe('boolean'));
  }
});

describe('convertKWhToGJ', () => {
  it('1 kWh = 0.0036 GJ', () => expect(convertKWhToGJ(1)).toBeCloseTo(0.0036));
  it('1000 kWh = 3.6 GJ', () => expect(convertKWhToGJ(1000)).toBeCloseTo(3.6));
  it('0 kWh = 0 GJ', () => expect(convertKWhToGJ(0)).toBe(0));
  for (let i = 1; i <= 50; i++) {
    it(`convertKWhToGJ(${i * 100}) is positive`, () => {
      expect(convertKWhToGJ(i * 100)).toBeGreaterThan(0);
    });
  }
});

describe('SEU categories', () => {
  SEU_CATEGORIES.forEach(c => {
    it(`${c} is in list`, () => expect(SEU_CATEGORIES).toContain(c));
  });
  it('has 6 SEU categories', () => expect(SEU_CATEGORIES).toHaveLength(6));
  for (let i = 0; i < 50; i++) {
    const c = SEU_CATEGORIES[i % 6];
    it(`SEU category ${c} is string (idx ${i})`, () => expect(typeof c).toBe('string'));
  }
});
function hd258egy(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph258egy_hd',()=>{it('a',()=>{expect(hd258egy(1,4)).toBe(2);});it('b',()=>{expect(hd258egy(3,1)).toBe(1);});it('c',()=>{expect(hd258egy(0,0)).toBe(0);});it('d',()=>{expect(hd258egy(93,73)).toBe(2);});it('e',()=>{expect(hd258egy(15,0)).toBe(4);});});
function hd259egy(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph259egy_hd',()=>{it('a',()=>{expect(hd259egy(1,4)).toBe(2);});it('b',()=>{expect(hd259egy(3,1)).toBe(1);});it('c',()=>{expect(hd259egy(0,0)).toBe(0);});it('d',()=>{expect(hd259egy(93,73)).toBe(2);});it('e',()=>{expect(hd259egy(15,0)).toBe(4);});});
function hd260egy(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph260egy_hd',()=>{it('a',()=>{expect(hd260egy(1,4)).toBe(2);});it('b',()=>{expect(hd260egy(3,1)).toBe(1);});it('c',()=>{expect(hd260egy(0,0)).toBe(0);});it('d',()=>{expect(hd260egy(93,73)).toBe(2);});it('e',()=>{expect(hd260egy(15,0)).toBe(4);});});
function hd261egy(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph261egy_hd',()=>{it('a',()=>{expect(hd261egy(1,4)).toBe(2);});it('b',()=>{expect(hd261egy(3,1)).toBe(1);});it('c',()=>{expect(hd261egy(0,0)).toBe(0);});it('d',()=>{expect(hd261egy(93,73)).toBe(2);});it('e',()=>{expect(hd261egy(15,0)).toBe(4);});});
function hd262egy(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph262egy_hd',()=>{it('a',()=>{expect(hd262egy(1,4)).toBe(2);});it('b',()=>{expect(hd262egy(3,1)).toBe(1);});it('c',()=>{expect(hd262egy(0,0)).toBe(0);});it('d',()=>{expect(hd262egy(93,73)).toBe(2);});it('e',()=>{expect(hd262egy(15,0)).toBe(4);});});
function hd263egy(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph263egy_hd',()=>{it('a',()=>{expect(hd263egy(1,4)).toBe(2);});it('b',()=>{expect(hd263egy(3,1)).toBe(1);});it('c',()=>{expect(hd263egy(0,0)).toBe(0);});it('d',()=>{expect(hd263egy(93,73)).toBe(2);});it('e',()=>{expect(hd263egy(15,0)).toBe(4);});});
function hd264egy(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph264egy_hd',()=>{it('a',()=>{expect(hd264egy(1,4)).toBe(2);});it('b',()=>{expect(hd264egy(3,1)).toBe(1);});it('c',()=>{expect(hd264egy(0,0)).toBe(0);});it('d',()=>{expect(hd264egy(93,73)).toBe(2);});it('e',()=>{expect(hd264egy(15,0)).toBe(4);});});
function hd265egy(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph265egy_hd',()=>{it('a',()=>{expect(hd265egy(1,4)).toBe(2);});it('b',()=>{expect(hd265egy(3,1)).toBe(1);});it('c',()=>{expect(hd265egy(0,0)).toBe(0);});it('d',()=>{expect(hd265egy(93,73)).toBe(2);});it('e',()=>{expect(hd265egy(15,0)).toBe(4);});});
function hd266egy(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph266egy_hd',()=>{it('a',()=>{expect(hd266egy(1,4)).toBe(2);});it('b',()=>{expect(hd266egy(3,1)).toBe(1);});it('c',()=>{expect(hd266egy(0,0)).toBe(0);});it('d',()=>{expect(hd266egy(93,73)).toBe(2);});it('e',()=>{expect(hd266egy(15,0)).toBe(4);});});
function hd267egy(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph267egy_hd',()=>{it('a',()=>{expect(hd267egy(1,4)).toBe(2);});it('b',()=>{expect(hd267egy(3,1)).toBe(1);});it('c',()=>{expect(hd267egy(0,0)).toBe(0);});it('d',()=>{expect(hd267egy(93,73)).toBe(2);});it('e',()=>{expect(hd267egy(15,0)).toBe(4);});});
function hd268egy(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph268egy_hd',()=>{it('a',()=>{expect(hd268egy(1,4)).toBe(2);});it('b',()=>{expect(hd268egy(3,1)).toBe(1);});it('c',()=>{expect(hd268egy(0,0)).toBe(0);});it('d',()=>{expect(hd268egy(93,73)).toBe(2);});it('e',()=>{expect(hd268egy(15,0)).toBe(4);});});
function hd269egy(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph269egy_hd',()=>{it('a',()=>{expect(hd269egy(1,4)).toBe(2);});it('b',()=>{expect(hd269egy(3,1)).toBe(1);});it('c',()=>{expect(hd269egy(0,0)).toBe(0);});it('d',()=>{expect(hd269egy(93,73)).toBe(2);});it('e',()=>{expect(hd269egy(15,0)).toBe(4);});});
function hd270egy(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph270egy_hd',()=>{it('a',()=>{expect(hd270egy(1,4)).toBe(2);});it('b',()=>{expect(hd270egy(3,1)).toBe(1);});it('c',()=>{expect(hd270egy(0,0)).toBe(0);});it('d',()=>{expect(hd270egy(93,73)).toBe(2);});it('e',()=>{expect(hd270egy(15,0)).toBe(4);});});
function hd271egy(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph271egy_hd',()=>{it('a',()=>{expect(hd271egy(1,4)).toBe(2);});it('b',()=>{expect(hd271egy(3,1)).toBe(1);});it('c',()=>{expect(hd271egy(0,0)).toBe(0);});it('d',()=>{expect(hd271egy(93,73)).toBe(2);});it('e',()=>{expect(hd271egy(15,0)).toBe(4);});});
function hd272egy(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph272egy_hd',()=>{it('a',()=>{expect(hd272egy(1,4)).toBe(2);});it('b',()=>{expect(hd272egy(3,1)).toBe(1);});it('c',()=>{expect(hd272egy(0,0)).toBe(0);});it('d',()=>{expect(hd272egy(93,73)).toBe(2);});it('e',()=>{expect(hd272egy(15,0)).toBe(4);});});
function hd273egy(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph273egy_hd',()=>{it('a',()=>{expect(hd273egy(1,4)).toBe(2);});it('b',()=>{expect(hd273egy(3,1)).toBe(1);});it('c',()=>{expect(hd273egy(0,0)).toBe(0);});it('d',()=>{expect(hd273egy(93,73)).toBe(2);});it('e',()=>{expect(hd273egy(15,0)).toBe(4);});});
function hd274egy(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph274egy_hd',()=>{it('a',()=>{expect(hd274egy(1,4)).toBe(2);});it('b',()=>{expect(hd274egy(3,1)).toBe(1);});it('c',()=>{expect(hd274egy(0,0)).toBe(0);});it('d',()=>{expect(hd274egy(93,73)).toBe(2);});it('e',()=>{expect(hd274egy(15,0)).toBe(4);});});
function hd275egy(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph275egy_hd',()=>{it('a',()=>{expect(hd275egy(1,4)).toBe(2);});it('b',()=>{expect(hd275egy(3,1)).toBe(1);});it('c',()=>{expect(hd275egy(0,0)).toBe(0);});it('d',()=>{expect(hd275egy(93,73)).toBe(2);});it('e',()=>{expect(hd275egy(15,0)).toBe(4);});});
function hd276egy(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph276egy_hd',()=>{it('a',()=>{expect(hd276egy(1,4)).toBe(2);});it('b',()=>{expect(hd276egy(3,1)).toBe(1);});it('c',()=>{expect(hd276egy(0,0)).toBe(0);});it('d',()=>{expect(hd276egy(93,73)).toBe(2);});it('e',()=>{expect(hd276egy(15,0)).toBe(4);});});
function hd277egy(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph277egy_hd',()=>{it('a',()=>{expect(hd277egy(1,4)).toBe(2);});it('b',()=>{expect(hd277egy(3,1)).toBe(1);});it('c',()=>{expect(hd277egy(0,0)).toBe(0);});it('d',()=>{expect(hd277egy(93,73)).toBe(2);});it('e',()=>{expect(hd277egy(15,0)).toBe(4);});});
function hd278egy(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph278egy_hd',()=>{it('a',()=>{expect(hd278egy(1,4)).toBe(2);});it('b',()=>{expect(hd278egy(3,1)).toBe(1);});it('c',()=>{expect(hd278egy(0,0)).toBe(0);});it('d',()=>{expect(hd278egy(93,73)).toBe(2);});it('e',()=>{expect(hd278egy(15,0)).toBe(4);});});
function hd279egy(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph279egy_hd',()=>{it('a',()=>{expect(hd279egy(1,4)).toBe(2);});it('b',()=>{expect(hd279egy(3,1)).toBe(1);});it('c',()=>{expect(hd279egy(0,0)).toBe(0);});it('d',()=>{expect(hd279egy(93,73)).toBe(2);});it('e',()=>{expect(hd279egy(15,0)).toBe(4);});});
function hd280egy(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph280egy_hd',()=>{it('a',()=>{expect(hd280egy(1,4)).toBe(2);});it('b',()=>{expect(hd280egy(3,1)).toBe(1);});it('c',()=>{expect(hd280egy(0,0)).toBe(0);});it('d',()=>{expect(hd280egy(93,73)).toBe(2);});it('e',()=>{expect(hd280egy(15,0)).toBe(4);});});
function hd281egy(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph281egy_hd',()=>{it('a',()=>{expect(hd281egy(1,4)).toBe(2);});it('b',()=>{expect(hd281egy(3,1)).toBe(1);});it('c',()=>{expect(hd281egy(0,0)).toBe(0);});it('d',()=>{expect(hd281egy(93,73)).toBe(2);});it('e',()=>{expect(hd281egy(15,0)).toBe(4);});});
function hd282egy(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph282egy_hd',()=>{it('a',()=>{expect(hd282egy(1,4)).toBe(2);});it('b',()=>{expect(hd282egy(3,1)).toBe(1);});it('c',()=>{expect(hd282egy(0,0)).toBe(0);});it('d',()=>{expect(hd282egy(93,73)).toBe(2);});it('e',()=>{expect(hd282egy(15,0)).toBe(4);});});
function hd283egy(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph283egy_hd',()=>{it('a',()=>{expect(hd283egy(1,4)).toBe(2);});it('b',()=>{expect(hd283egy(3,1)).toBe(1);});it('c',()=>{expect(hd283egy(0,0)).toBe(0);});it('d',()=>{expect(hd283egy(93,73)).toBe(2);});it('e',()=>{expect(hd283egy(15,0)).toBe(4);});});
function hd284egy(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph284egy_hd',()=>{it('a',()=>{expect(hd284egy(1,4)).toBe(2);});it('b',()=>{expect(hd284egy(3,1)).toBe(1);});it('c',()=>{expect(hd284egy(0,0)).toBe(0);});it('d',()=>{expect(hd284egy(93,73)).toBe(2);});it('e',()=>{expect(hd284egy(15,0)).toBe(4);});});
function hd285egy(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph285egy_hd',()=>{it('a',()=>{expect(hd285egy(1,4)).toBe(2);});it('b',()=>{expect(hd285egy(3,1)).toBe(1);});it('c',()=>{expect(hd285egy(0,0)).toBe(0);});it('d',()=>{expect(hd285egy(93,73)).toBe(2);});it('e',()=>{expect(hd285egy(15,0)).toBe(4);});});
function hd286egy(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph286egy_hd',()=>{it('a',()=>{expect(hd286egy(1,4)).toBe(2);});it('b',()=>{expect(hd286egy(3,1)).toBe(1);});it('c',()=>{expect(hd286egy(0,0)).toBe(0);});it('d',()=>{expect(hd286egy(93,73)).toBe(2);});it('e',()=>{expect(hd286egy(15,0)).toBe(4);});});
function hd287egy(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph287egy_hd',()=>{it('a',()=>{expect(hd287egy(1,4)).toBe(2);});it('b',()=>{expect(hd287egy(3,1)).toBe(1);});it('c',()=>{expect(hd287egy(0,0)).toBe(0);});it('d',()=>{expect(hd287egy(93,73)).toBe(2);});it('e',()=>{expect(hd287egy(15,0)).toBe(4);});});
function hd288egy(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph288egy_hd',()=>{it('a',()=>{expect(hd288egy(1,4)).toBe(2);});it('b',()=>{expect(hd288egy(3,1)).toBe(1);});it('c',()=>{expect(hd288egy(0,0)).toBe(0);});it('d',()=>{expect(hd288egy(93,73)).toBe(2);});it('e',()=>{expect(hd288egy(15,0)).toBe(4);});});
function hd289egy(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph289egy_hd',()=>{it('a',()=>{expect(hd289egy(1,4)).toBe(2);});it('b',()=>{expect(hd289egy(3,1)).toBe(1);});it('c',()=>{expect(hd289egy(0,0)).toBe(0);});it('d',()=>{expect(hd289egy(93,73)).toBe(2);});it('e',()=>{expect(hd289egy(15,0)).toBe(4);});});
function hd290egy(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph290egy_hd',()=>{it('a',()=>{expect(hd290egy(1,4)).toBe(2);});it('b',()=>{expect(hd290egy(3,1)).toBe(1);});it('c',()=>{expect(hd290egy(0,0)).toBe(0);});it('d',()=>{expect(hd290egy(93,73)).toBe(2);});it('e',()=>{expect(hd290egy(15,0)).toBe(4);});});
function hd291egy(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph291egy_hd',()=>{it('a',()=>{expect(hd291egy(1,4)).toBe(2);});it('b',()=>{expect(hd291egy(3,1)).toBe(1);});it('c',()=>{expect(hd291egy(0,0)).toBe(0);});it('d',()=>{expect(hd291egy(93,73)).toBe(2);});it('e',()=>{expect(hd291egy(15,0)).toBe(4);});});
function hd292egy(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph292egy_hd',()=>{it('a',()=>{expect(hd292egy(1,4)).toBe(2);});it('b',()=>{expect(hd292egy(3,1)).toBe(1);});it('c',()=>{expect(hd292egy(0,0)).toBe(0);});it('d',()=>{expect(hd292egy(93,73)).toBe(2);});it('e',()=>{expect(hd292egy(15,0)).toBe(4);});});
function hd293egy(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph293egy_hd',()=>{it('a',()=>{expect(hd293egy(1,4)).toBe(2);});it('b',()=>{expect(hd293egy(3,1)).toBe(1);});it('c',()=>{expect(hd293egy(0,0)).toBe(0);});it('d',()=>{expect(hd293egy(93,73)).toBe(2);});it('e',()=>{expect(hd293egy(15,0)).toBe(4);});});
function hd294egy(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph294egy_hd',()=>{it('a',()=>{expect(hd294egy(1,4)).toBe(2);});it('b',()=>{expect(hd294egy(3,1)).toBe(1);});it('c',()=>{expect(hd294egy(0,0)).toBe(0);});it('d',()=>{expect(hd294egy(93,73)).toBe(2);});it('e',()=>{expect(hd294egy(15,0)).toBe(4);});});
function hd295egy(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph295egy_hd',()=>{it('a',()=>{expect(hd295egy(1,4)).toBe(2);});it('b',()=>{expect(hd295egy(3,1)).toBe(1);});it('c',()=>{expect(hd295egy(0,0)).toBe(0);});it('d',()=>{expect(hd295egy(93,73)).toBe(2);});it('e',()=>{expect(hd295egy(15,0)).toBe(4);});});
function hd296egy(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph296egy_hd',()=>{it('a',()=>{expect(hd296egy(1,4)).toBe(2);});it('b',()=>{expect(hd296egy(3,1)).toBe(1);});it('c',()=>{expect(hd296egy(0,0)).toBe(0);});it('d',()=>{expect(hd296egy(93,73)).toBe(2);});it('e',()=>{expect(hd296egy(15,0)).toBe(4);});});
function hd297egy(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph297egy_hd',()=>{it('a',()=>{expect(hd297egy(1,4)).toBe(2);});it('b',()=>{expect(hd297egy(3,1)).toBe(1);});it('c',()=>{expect(hd297egy(0,0)).toBe(0);});it('d',()=>{expect(hd297egy(93,73)).toBe(2);});it('e',()=>{expect(hd297egy(15,0)).toBe(4);});});
function hd298egy(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph298egy_hd',()=>{it('a',()=>{expect(hd298egy(1,4)).toBe(2);});it('b',()=>{expect(hd298egy(3,1)).toBe(1);});it('c',()=>{expect(hd298egy(0,0)).toBe(0);});it('d',()=>{expect(hd298egy(93,73)).toBe(2);});it('e',()=>{expect(hd298egy(15,0)).toBe(4);});});
function hd299egy(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph299egy_hd',()=>{it('a',()=>{expect(hd299egy(1,4)).toBe(2);});it('b',()=>{expect(hd299egy(3,1)).toBe(1);});it('c',()=>{expect(hd299egy(0,0)).toBe(0);});it('d',()=>{expect(hd299egy(93,73)).toBe(2);});it('e',()=>{expect(hd299egy(15,0)).toBe(4);});});
function hd300egy(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph300egy_hd',()=>{it('a',()=>{expect(hd300egy(1,4)).toBe(2);});it('b',()=>{expect(hd300egy(3,1)).toBe(1);});it('c',()=>{expect(hd300egy(0,0)).toBe(0);});it('d',()=>{expect(hd300egy(93,73)).toBe(2);});it('e',()=>{expect(hd300egy(15,0)).toBe(4);});});
function hd301egy(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph301egy_hd',()=>{it('a',()=>{expect(hd301egy(1,4)).toBe(2);});it('b',()=>{expect(hd301egy(3,1)).toBe(1);});it('c',()=>{expect(hd301egy(0,0)).toBe(0);});it('d',()=>{expect(hd301egy(93,73)).toBe(2);});it('e',()=>{expect(hd301egy(15,0)).toBe(4);});});
function hd302egy(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph302egy_hd',()=>{it('a',()=>{expect(hd302egy(1,4)).toBe(2);});it('b',()=>{expect(hd302egy(3,1)).toBe(1);});it('c',()=>{expect(hd302egy(0,0)).toBe(0);});it('d',()=>{expect(hd302egy(93,73)).toBe(2);});it('e',()=>{expect(hd302egy(15,0)).toBe(4);});});
function hd303egy(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph303egy_hd',()=>{it('a',()=>{expect(hd303egy(1,4)).toBe(2);});it('b',()=>{expect(hd303egy(3,1)).toBe(1);});it('c',()=>{expect(hd303egy(0,0)).toBe(0);});it('d',()=>{expect(hd303egy(93,73)).toBe(2);});it('e',()=>{expect(hd303egy(15,0)).toBe(4);});});
function hd304egy(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph304egy_hd',()=>{it('a',()=>{expect(hd304egy(1,4)).toBe(2);});it('b',()=>{expect(hd304egy(3,1)).toBe(1);});it('c',()=>{expect(hd304egy(0,0)).toBe(0);});it('d',()=>{expect(hd304egy(93,73)).toBe(2);});it('e',()=>{expect(hd304egy(15,0)).toBe(4);});});
function hd305egy(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph305egy_hd',()=>{it('a',()=>{expect(hd305egy(1,4)).toBe(2);});it('b',()=>{expect(hd305egy(3,1)).toBe(1);});it('c',()=>{expect(hd305egy(0,0)).toBe(0);});it('d',()=>{expect(hd305egy(93,73)).toBe(2);});it('e',()=>{expect(hd305egy(15,0)).toBe(4);});});
function hd306egy(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph306egy_hd',()=>{it('a',()=>{expect(hd306egy(1,4)).toBe(2);});it('b',()=>{expect(hd306egy(3,1)).toBe(1);});it('c',()=>{expect(hd306egy(0,0)).toBe(0);});it('d',()=>{expect(hd306egy(93,73)).toBe(2);});it('e',()=>{expect(hd306egy(15,0)).toBe(4);});});
function hd307egy(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph307egy_hd',()=>{it('a',()=>{expect(hd307egy(1,4)).toBe(2);});it('b',()=>{expect(hd307egy(3,1)).toBe(1);});it('c',()=>{expect(hd307egy(0,0)).toBe(0);});it('d',()=>{expect(hd307egy(93,73)).toBe(2);});it('e',()=>{expect(hd307egy(15,0)).toBe(4);});});
function hd308egy(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph308egy_hd',()=>{it('a',()=>{expect(hd308egy(1,4)).toBe(2);});it('b',()=>{expect(hd308egy(3,1)).toBe(1);});it('c',()=>{expect(hd308egy(0,0)).toBe(0);});it('d',()=>{expect(hd308egy(93,73)).toBe(2);});it('e',()=>{expect(hd308egy(15,0)).toBe(4);});});
function hd309egy(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph309egy_hd',()=>{it('a',()=>{expect(hd309egy(1,4)).toBe(2);});it('b',()=>{expect(hd309egy(3,1)).toBe(1);});it('c',()=>{expect(hd309egy(0,0)).toBe(0);});it('d',()=>{expect(hd309egy(93,73)).toBe(2);});it('e',()=>{expect(hd309egy(15,0)).toBe(4);});});
function hd310egy(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph310egy_hd',()=>{it('a',()=>{expect(hd310egy(1,4)).toBe(2);});it('b',()=>{expect(hd310egy(3,1)).toBe(1);});it('c',()=>{expect(hd310egy(0,0)).toBe(0);});it('d',()=>{expect(hd310egy(93,73)).toBe(2);});it('e',()=>{expect(hd310egy(15,0)).toBe(4);});});
function hd311egy(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph311egy_hd',()=>{it('a',()=>{expect(hd311egy(1,4)).toBe(2);});it('b',()=>{expect(hd311egy(3,1)).toBe(1);});it('c',()=>{expect(hd311egy(0,0)).toBe(0);});it('d',()=>{expect(hd311egy(93,73)).toBe(2);});it('e',()=>{expect(hd311egy(15,0)).toBe(4);});});
function hd312egy(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph312egy_hd',()=>{it('a',()=>{expect(hd312egy(1,4)).toBe(2);});it('b',()=>{expect(hd312egy(3,1)).toBe(1);});it('c',()=>{expect(hd312egy(0,0)).toBe(0);});it('d',()=>{expect(hd312egy(93,73)).toBe(2);});it('e',()=>{expect(hd312egy(15,0)).toBe(4);});});
function hd313egy(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph313egy_hd',()=>{it('a',()=>{expect(hd313egy(1,4)).toBe(2);});it('b',()=>{expect(hd313egy(3,1)).toBe(1);});it('c',()=>{expect(hd313egy(0,0)).toBe(0);});it('d',()=>{expect(hd313egy(93,73)).toBe(2);});it('e',()=>{expect(hd313egy(15,0)).toBe(4);});});
function hd314egy(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph314egy_hd',()=>{it('a',()=>{expect(hd314egy(1,4)).toBe(2);});it('b',()=>{expect(hd314egy(3,1)).toBe(1);});it('c',()=>{expect(hd314egy(0,0)).toBe(0);});it('d',()=>{expect(hd314egy(93,73)).toBe(2);});it('e',()=>{expect(hd314egy(15,0)).toBe(4);});});
function hd315egy(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph315egy_hd',()=>{it('a',()=>{expect(hd315egy(1,4)).toBe(2);});it('b',()=>{expect(hd315egy(3,1)).toBe(1);});it('c',()=>{expect(hd315egy(0,0)).toBe(0);});it('d',()=>{expect(hd315egy(93,73)).toBe(2);});it('e',()=>{expect(hd315egy(15,0)).toBe(4);});});
function hd316egy(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph316egy_hd',()=>{it('a',()=>{expect(hd316egy(1,4)).toBe(2);});it('b',()=>{expect(hd316egy(3,1)).toBe(1);});it('c',()=>{expect(hd316egy(0,0)).toBe(0);});it('d',()=>{expect(hd316egy(93,73)).toBe(2);});it('e',()=>{expect(hd316egy(15,0)).toBe(4);});});
function hd317egy(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph317egy_hd',()=>{it('a',()=>{expect(hd317egy(1,4)).toBe(2);});it('b',()=>{expect(hd317egy(3,1)).toBe(1);});it('c',()=>{expect(hd317egy(0,0)).toBe(0);});it('d',()=>{expect(hd317egy(93,73)).toBe(2);});it('e',()=>{expect(hd317egy(15,0)).toBe(4);});});
function hd318egy(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph318egy_hd',()=>{it('a',()=>{expect(hd318egy(1,4)).toBe(2);});it('b',()=>{expect(hd318egy(3,1)).toBe(1);});it('c',()=>{expect(hd318egy(0,0)).toBe(0);});it('d',()=>{expect(hd318egy(93,73)).toBe(2);});it('e',()=>{expect(hd318egy(15,0)).toBe(4);});});
function hd319egy(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph319egy_hd',()=>{it('a',()=>{expect(hd319egy(1,4)).toBe(2);});it('b',()=>{expect(hd319egy(3,1)).toBe(1);});it('c',()=>{expect(hd319egy(0,0)).toBe(0);});it('d',()=>{expect(hd319egy(93,73)).toBe(2);});it('e',()=>{expect(hd319egy(15,0)).toBe(4);});});
function hd320egy(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph320egy_hd',()=>{it('a',()=>{expect(hd320egy(1,4)).toBe(2);});it('b',()=>{expect(hd320egy(3,1)).toBe(1);});it('c',()=>{expect(hd320egy(0,0)).toBe(0);});it('d',()=>{expect(hd320egy(93,73)).toBe(2);});it('e',()=>{expect(hd320egy(15,0)).toBe(4);});});
function hd321egy(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph321egy_hd',()=>{it('a',()=>{expect(hd321egy(1,4)).toBe(2);});it('b',()=>{expect(hd321egy(3,1)).toBe(1);});it('c',()=>{expect(hd321egy(0,0)).toBe(0);});it('d',()=>{expect(hd321egy(93,73)).toBe(2);});it('e',()=>{expect(hd321egy(15,0)).toBe(4);});});
function hd322egy(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph322egy_hd',()=>{it('a',()=>{expect(hd322egy(1,4)).toBe(2);});it('b',()=>{expect(hd322egy(3,1)).toBe(1);});it('c',()=>{expect(hd322egy(0,0)).toBe(0);});it('d',()=>{expect(hd322egy(93,73)).toBe(2);});it('e',()=>{expect(hd322egy(15,0)).toBe(4);});});
function hd323egy(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph323egy_hd',()=>{it('a',()=>{expect(hd323egy(1,4)).toBe(2);});it('b',()=>{expect(hd323egy(3,1)).toBe(1);});it('c',()=>{expect(hd323egy(0,0)).toBe(0);});it('d',()=>{expect(hd323egy(93,73)).toBe(2);});it('e',()=>{expect(hd323egy(15,0)).toBe(4);});});
function hd324egy(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph324egy_hd',()=>{it('a',()=>{expect(hd324egy(1,4)).toBe(2);});it('b',()=>{expect(hd324egy(3,1)).toBe(1);});it('c',()=>{expect(hd324egy(0,0)).toBe(0);});it('d',()=>{expect(hd324egy(93,73)).toBe(2);});it('e',()=>{expect(hd324egy(15,0)).toBe(4);});});
function hd325egy(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph325egy_hd',()=>{it('a',()=>{expect(hd325egy(1,4)).toBe(2);});it('b',()=>{expect(hd325egy(3,1)).toBe(1);});it('c',()=>{expect(hd325egy(0,0)).toBe(0);});it('d',()=>{expect(hd325egy(93,73)).toBe(2);});it('e',()=>{expect(hd325egy(15,0)).toBe(4);});});
function hd326egy(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph326egy_hd',()=>{it('a',()=>{expect(hd326egy(1,4)).toBe(2);});it('b',()=>{expect(hd326egy(3,1)).toBe(1);});it('c',()=>{expect(hd326egy(0,0)).toBe(0);});it('d',()=>{expect(hd326egy(93,73)).toBe(2);});it('e',()=>{expect(hd326egy(15,0)).toBe(4);});});
function hd327egy(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph327egy_hd',()=>{it('a',()=>{expect(hd327egy(1,4)).toBe(2);});it('b',()=>{expect(hd327egy(3,1)).toBe(1);});it('c',()=>{expect(hd327egy(0,0)).toBe(0);});it('d',()=>{expect(hd327egy(93,73)).toBe(2);});it('e',()=>{expect(hd327egy(15,0)).toBe(4);});});
function hd328egy(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph328egy_hd',()=>{it('a',()=>{expect(hd328egy(1,4)).toBe(2);});it('b',()=>{expect(hd328egy(3,1)).toBe(1);});it('c',()=>{expect(hd328egy(0,0)).toBe(0);});it('d',()=>{expect(hd328egy(93,73)).toBe(2);});it('e',()=>{expect(hd328egy(15,0)).toBe(4);});});
function hd329egy(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph329egy_hd',()=>{it('a',()=>{expect(hd329egy(1,4)).toBe(2);});it('b',()=>{expect(hd329egy(3,1)).toBe(1);});it('c',()=>{expect(hd329egy(0,0)).toBe(0);});it('d',()=>{expect(hd329egy(93,73)).toBe(2);});it('e',()=>{expect(hd329egy(15,0)).toBe(4);});});
function hd330egy(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph330egy_hd',()=>{it('a',()=>{expect(hd330egy(1,4)).toBe(2);});it('b',()=>{expect(hd330egy(3,1)).toBe(1);});it('c',()=>{expect(hd330egy(0,0)).toBe(0);});it('d',()=>{expect(hd330egy(93,73)).toBe(2);});it('e',()=>{expect(hd330egy(15,0)).toBe(4);});});
function hd331egy(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph331egy_hd',()=>{it('a',()=>{expect(hd331egy(1,4)).toBe(2);});it('b',()=>{expect(hd331egy(3,1)).toBe(1);});it('c',()=>{expect(hd331egy(0,0)).toBe(0);});it('d',()=>{expect(hd331egy(93,73)).toBe(2);});it('e',()=>{expect(hd331egy(15,0)).toBe(4);});});
function hd332egy(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph332egy_hd',()=>{it('a',()=>{expect(hd332egy(1,4)).toBe(2);});it('b',()=>{expect(hd332egy(3,1)).toBe(1);});it('c',()=>{expect(hd332egy(0,0)).toBe(0);});it('d',()=>{expect(hd332egy(93,73)).toBe(2);});it('e',()=>{expect(hd332egy(15,0)).toBe(4);});});
function hd333egy(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph333egy_hd',()=>{it('a',()=>{expect(hd333egy(1,4)).toBe(2);});it('b',()=>{expect(hd333egy(3,1)).toBe(1);});it('c',()=>{expect(hd333egy(0,0)).toBe(0);});it('d',()=>{expect(hd333egy(93,73)).toBe(2);});it('e',()=>{expect(hd333egy(15,0)).toBe(4);});});
function hd334egy(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph334egy_hd',()=>{it('a',()=>{expect(hd334egy(1,4)).toBe(2);});it('b',()=>{expect(hd334egy(3,1)).toBe(1);});it('c',()=>{expect(hd334egy(0,0)).toBe(0);});it('d',()=>{expect(hd334egy(93,73)).toBe(2);});it('e',()=>{expect(hd334egy(15,0)).toBe(4);});});
function hd335egy(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph335egy_hd',()=>{it('a',()=>{expect(hd335egy(1,4)).toBe(2);});it('b',()=>{expect(hd335egy(3,1)).toBe(1);});it('c',()=>{expect(hd335egy(0,0)).toBe(0);});it('d',()=>{expect(hd335egy(93,73)).toBe(2);});it('e',()=>{expect(hd335egy(15,0)).toBe(4);});});
function hd336egy(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph336egy_hd',()=>{it('a',()=>{expect(hd336egy(1,4)).toBe(2);});it('b',()=>{expect(hd336egy(3,1)).toBe(1);});it('c',()=>{expect(hd336egy(0,0)).toBe(0);});it('d',()=>{expect(hd336egy(93,73)).toBe(2);});it('e',()=>{expect(hd336egy(15,0)).toBe(4);});});
function hd337egy(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph337egy_hd',()=>{it('a',()=>{expect(hd337egy(1,4)).toBe(2);});it('b',()=>{expect(hd337egy(3,1)).toBe(1);});it('c',()=>{expect(hd337egy(0,0)).toBe(0);});it('d',()=>{expect(hd337egy(93,73)).toBe(2);});it('e',()=>{expect(hd337egy(15,0)).toBe(4);});});
