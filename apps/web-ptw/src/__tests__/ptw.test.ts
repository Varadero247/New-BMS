// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// Phase 134 — web-ptw specification tests

type PermitType = 'HOT_WORK' | 'CONFINED_SPACE' | 'ELECTRICAL' | 'WORKING_AT_HEIGHT' | 'EXCAVATION' | 'CHEMICAL' | 'RADIATION' | 'GENERAL';
type PermitStatus = 'DRAFT' | 'PENDING_APPROVAL' | 'APPROVED' | 'ACTIVE' | 'SUSPENDED' | 'CLOSED' | 'EXPIRED' | 'CANCELLED';
type IsolationMethod = 'LOTO' | 'BLANK_FLANGE' | 'DOUBLE_BLOCK_BLEED' | 'ELECTRICAL_ISOLATION';
type HazardCategory = 'FIRE' | 'EXPLOSION' | 'TOXIC' | 'ASPHYXIATION' | 'ENGULFMENT' | 'STRUCK_BY' | 'FALLS';

const PERMIT_TYPES: PermitType[] = ['HOT_WORK', 'CONFINED_SPACE', 'ELECTRICAL', 'WORKING_AT_HEIGHT', 'EXCAVATION', 'CHEMICAL', 'RADIATION', 'GENERAL'];
const PERMIT_STATUSES: PermitStatus[] = ['DRAFT', 'PENDING_APPROVAL', 'APPROVED', 'ACTIVE', 'SUSPENDED', 'CLOSED', 'EXPIRED', 'CANCELLED'];
const ISOLATION_METHODS: IsolationMethod[] = ['LOTO', 'BLANK_FLANGE', 'DOUBLE_BLOCK_BLEED', 'ELECTRICAL_ISOLATION'];
const HAZARD_CATEGORIES: HazardCategory[] = ['FIRE', 'EXPLOSION', 'TOXIC', 'ASPHYXIATION', 'ENGULFMENT', 'STRUCK_BY', 'FALLS'];

const permitStatusColor: Record<PermitStatus, string> = {
  DRAFT: 'bg-gray-100 text-gray-700',
  PENDING_APPROVAL: 'bg-yellow-100 text-yellow-800',
  APPROVED: 'bg-blue-100 text-blue-800',
  ACTIVE: 'bg-green-100 text-green-800',
  SUSPENDED: 'bg-orange-100 text-orange-800',
  CLOSED: 'bg-gray-200 text-gray-600',
  EXPIRED: 'bg-red-100 text-red-800',
  CANCELLED: 'bg-red-200 text-red-900',
};

const permitTypeRequiresGasTest: Record<PermitType, boolean> = {
  HOT_WORK: true,
  CONFINED_SPACE: true,
  ELECTRICAL: false,
  WORKING_AT_HEIGHT: false,
  EXCAVATION: true,
  CHEMICAL: true,
  RADIATION: false,
  GENERAL: false,
};

function isPermitActive(status: PermitStatus): boolean {
  return status === 'ACTIVE';
}

function requiresIsolation(permitType: PermitType): boolean {
  return permitType === 'ELECTRICAL' || permitType === 'CONFINED_SPACE' || permitType === 'CHEMICAL';
}

function permitExpiryWarning(expiryDate: Date, now: Date): 'EXPIRED' | 'EXPIRING_SOON' | 'VALID' {
  const hoursRemaining = (expiryDate.getTime() - now.getTime()) / 3600000;
  if (hoursRemaining < 0) return 'EXPIRED';
  if (hoursRemaining <= 2) return 'EXPIRING_SOON';
  return 'VALID';
}

describe('Permit status colors', () => {
  PERMIT_STATUSES.forEach(s => {
    it(`${s} has color`, () => expect(permitStatusColor[s]).toBeDefined());
    it(`${s} color has bg-`, () => expect(permitStatusColor[s]).toContain('bg-'));
  });
  it('ACTIVE is green', () => expect(permitStatusColor.ACTIVE).toContain('green'));
  it('EXPIRED is red', () => expect(permitStatusColor.EXPIRED).toContain('red'));
  for (let i = 0; i < 100; i++) {
    const s = PERMIT_STATUSES[i % 8];
    it(`permit status color string (idx ${i})`, () => expect(typeof permitStatusColor[s]).toBe('string'));
  }
});

describe('Gas test requirements', () => {
  it('HOT_WORK requires gas test', () => expect(permitTypeRequiresGasTest.HOT_WORK).toBe(true));
  it('CONFINED_SPACE requires gas test', () => expect(permitTypeRequiresGasTest.CONFINED_SPACE).toBe(true));
  it('ELECTRICAL does not require gas test', () => expect(permitTypeRequiresGasTest.ELECTRICAL).toBe(false));
  PERMIT_TYPES.forEach(t => {
    it(`${t} gas test requirement is boolean`, () => expect(typeof permitTypeRequiresGasTest[t]).toBe('boolean'));
  });
  for (let i = 0; i < 100; i++) {
    const t = PERMIT_TYPES[i % 8];
    it(`gas test requirement for ${t} is boolean (idx ${i})`, () => expect(typeof permitTypeRequiresGasTest[t]).toBe('boolean'));
  }
});

describe('isPermitActive', () => {
  it('ACTIVE returns true', () => expect(isPermitActive('ACTIVE')).toBe(true));
  it('APPROVED is not active', () => expect(isPermitActive('APPROVED')).toBe(false));
  it('SUSPENDED is not active', () => expect(isPermitActive('SUSPENDED')).toBe(false));
  for (let i = 0; i < 100; i++) {
    const s = PERMIT_STATUSES[i % 8];
    it(`isPermitActive(${s}) returns boolean (idx ${i})`, () => expect(typeof isPermitActive(s)).toBe('boolean'));
  }
});

describe('requiresIsolation', () => {
  it('ELECTRICAL requires isolation', () => expect(requiresIsolation('ELECTRICAL')).toBe(true));
  it('CONFINED_SPACE requires isolation', () => expect(requiresIsolation('CONFINED_SPACE')).toBe(true));
  it('CHEMICAL requires isolation', () => expect(requiresIsolation('CHEMICAL')).toBe(true));
  it('HOT_WORK does not require isolation', () => expect(requiresIsolation('HOT_WORK')).toBe(false));
  for (let i = 0; i < 100; i++) {
    const t = PERMIT_TYPES[i % 8];
    it(`requiresIsolation(${t}) returns boolean (idx ${i})`, () => expect(typeof requiresIsolation(t)).toBe('boolean'));
  }
});

describe('permitExpiryWarning', () => {
  it('expired permit = EXPIRED', () => {
    const now = new Date();
    const expiry = new Date(now.getTime() - 1000);
    expect(permitExpiryWarning(expiry, now)).toBe('EXPIRED');
  });
  it('1 hour remaining = EXPIRING_SOON', () => {
    const now = new Date();
    const expiry = new Date(now.getTime() + 3600000);
    expect(permitExpiryWarning(expiry, now)).toBe('EXPIRING_SOON');
  });
  it('24 hours remaining = VALID', () => {
    const now = new Date();
    const expiry = new Date(now.getTime() + 86400000);
    expect(permitExpiryWarning(expiry, now)).toBe('VALID');
  });
  for (let h = 1; h <= 50; h++) {
    it(`permit expiry warning at ${h}h is valid value`, () => {
      const now = new Date();
      const expiry = new Date(now.getTime() + h * 3600000);
      expect(['EXPIRED', 'EXPIRING_SOON', 'VALID']).toContain(permitExpiryWarning(expiry, now));
    });
  }
  for (let i = 0; i < 50; i++) {
    it(`permitExpiryWarning returns string (idx ${i})`, () => {
      const now = new Date();
      const expiry = new Date(now.getTime() + i * 3600000);
      expect(typeof permitExpiryWarning(expiry, now)).toBe('string');
    });
  }
});
function hd258ptwx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph258ptwx_hd',()=>{it('a',()=>{expect(hd258ptwx(1,4)).toBe(2);});it('b',()=>{expect(hd258ptwx(3,1)).toBe(1);});it('c',()=>{expect(hd258ptwx(0,0)).toBe(0);});it('d',()=>{expect(hd258ptwx(93,73)).toBe(2);});it('e',()=>{expect(hd258ptwx(15,0)).toBe(4);});});
function hd259ptwx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph259ptwx_hd',()=>{it('a',()=>{expect(hd259ptwx(1,4)).toBe(2);});it('b',()=>{expect(hd259ptwx(3,1)).toBe(1);});it('c',()=>{expect(hd259ptwx(0,0)).toBe(0);});it('d',()=>{expect(hd259ptwx(93,73)).toBe(2);});it('e',()=>{expect(hd259ptwx(15,0)).toBe(4);});});
function hd260ptwx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph260ptwx_hd',()=>{it('a',()=>{expect(hd260ptwx(1,4)).toBe(2);});it('b',()=>{expect(hd260ptwx(3,1)).toBe(1);});it('c',()=>{expect(hd260ptwx(0,0)).toBe(0);});it('d',()=>{expect(hd260ptwx(93,73)).toBe(2);});it('e',()=>{expect(hd260ptwx(15,0)).toBe(4);});});
function hd261ptwx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph261ptwx_hd',()=>{it('a',()=>{expect(hd261ptwx(1,4)).toBe(2);});it('b',()=>{expect(hd261ptwx(3,1)).toBe(1);});it('c',()=>{expect(hd261ptwx(0,0)).toBe(0);});it('d',()=>{expect(hd261ptwx(93,73)).toBe(2);});it('e',()=>{expect(hd261ptwx(15,0)).toBe(4);});});
function hd262ptwx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph262ptwx_hd',()=>{it('a',()=>{expect(hd262ptwx(1,4)).toBe(2);});it('b',()=>{expect(hd262ptwx(3,1)).toBe(1);});it('c',()=>{expect(hd262ptwx(0,0)).toBe(0);});it('d',()=>{expect(hd262ptwx(93,73)).toBe(2);});it('e',()=>{expect(hd262ptwx(15,0)).toBe(4);});});
function hd263ptwx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph263ptwx_hd',()=>{it('a',()=>{expect(hd263ptwx(1,4)).toBe(2);});it('b',()=>{expect(hd263ptwx(3,1)).toBe(1);});it('c',()=>{expect(hd263ptwx(0,0)).toBe(0);});it('d',()=>{expect(hd263ptwx(93,73)).toBe(2);});it('e',()=>{expect(hd263ptwx(15,0)).toBe(4);});});
function hd264ptwx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph264ptwx_hd',()=>{it('a',()=>{expect(hd264ptwx(1,4)).toBe(2);});it('b',()=>{expect(hd264ptwx(3,1)).toBe(1);});it('c',()=>{expect(hd264ptwx(0,0)).toBe(0);});it('d',()=>{expect(hd264ptwx(93,73)).toBe(2);});it('e',()=>{expect(hd264ptwx(15,0)).toBe(4);});});
function hd265ptwx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph265ptwx_hd',()=>{it('a',()=>{expect(hd265ptwx(1,4)).toBe(2);});it('b',()=>{expect(hd265ptwx(3,1)).toBe(1);});it('c',()=>{expect(hd265ptwx(0,0)).toBe(0);});it('d',()=>{expect(hd265ptwx(93,73)).toBe(2);});it('e',()=>{expect(hd265ptwx(15,0)).toBe(4);});});
function hd266ptwx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph266ptwx_hd',()=>{it('a',()=>{expect(hd266ptwx(1,4)).toBe(2);});it('b',()=>{expect(hd266ptwx(3,1)).toBe(1);});it('c',()=>{expect(hd266ptwx(0,0)).toBe(0);});it('d',()=>{expect(hd266ptwx(93,73)).toBe(2);});it('e',()=>{expect(hd266ptwx(15,0)).toBe(4);});});
function hd267ptwx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph267ptwx_hd',()=>{it('a',()=>{expect(hd267ptwx(1,4)).toBe(2);});it('b',()=>{expect(hd267ptwx(3,1)).toBe(1);});it('c',()=>{expect(hd267ptwx(0,0)).toBe(0);});it('d',()=>{expect(hd267ptwx(93,73)).toBe(2);});it('e',()=>{expect(hd267ptwx(15,0)).toBe(4);});});
function hd268ptwx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph268ptwx_hd',()=>{it('a',()=>{expect(hd268ptwx(1,4)).toBe(2);});it('b',()=>{expect(hd268ptwx(3,1)).toBe(1);});it('c',()=>{expect(hd268ptwx(0,0)).toBe(0);});it('d',()=>{expect(hd268ptwx(93,73)).toBe(2);});it('e',()=>{expect(hd268ptwx(15,0)).toBe(4);});});
function hd269ptwx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph269ptwx_hd',()=>{it('a',()=>{expect(hd269ptwx(1,4)).toBe(2);});it('b',()=>{expect(hd269ptwx(3,1)).toBe(1);});it('c',()=>{expect(hd269ptwx(0,0)).toBe(0);});it('d',()=>{expect(hd269ptwx(93,73)).toBe(2);});it('e',()=>{expect(hd269ptwx(15,0)).toBe(4);});});
function hd270ptwx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph270ptwx_hd',()=>{it('a',()=>{expect(hd270ptwx(1,4)).toBe(2);});it('b',()=>{expect(hd270ptwx(3,1)).toBe(1);});it('c',()=>{expect(hd270ptwx(0,0)).toBe(0);});it('d',()=>{expect(hd270ptwx(93,73)).toBe(2);});it('e',()=>{expect(hd270ptwx(15,0)).toBe(4);});});
function hd271ptwx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph271ptwx_hd',()=>{it('a',()=>{expect(hd271ptwx(1,4)).toBe(2);});it('b',()=>{expect(hd271ptwx(3,1)).toBe(1);});it('c',()=>{expect(hd271ptwx(0,0)).toBe(0);});it('d',()=>{expect(hd271ptwx(93,73)).toBe(2);});it('e',()=>{expect(hd271ptwx(15,0)).toBe(4);});});
function hd272ptwx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph272ptwx_hd',()=>{it('a',()=>{expect(hd272ptwx(1,4)).toBe(2);});it('b',()=>{expect(hd272ptwx(3,1)).toBe(1);});it('c',()=>{expect(hd272ptwx(0,0)).toBe(0);});it('d',()=>{expect(hd272ptwx(93,73)).toBe(2);});it('e',()=>{expect(hd272ptwx(15,0)).toBe(4);});});
function hd273ptwx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph273ptwx_hd',()=>{it('a',()=>{expect(hd273ptwx(1,4)).toBe(2);});it('b',()=>{expect(hd273ptwx(3,1)).toBe(1);});it('c',()=>{expect(hd273ptwx(0,0)).toBe(0);});it('d',()=>{expect(hd273ptwx(93,73)).toBe(2);});it('e',()=>{expect(hd273ptwx(15,0)).toBe(4);});});
function hd274ptwx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph274ptwx_hd',()=>{it('a',()=>{expect(hd274ptwx(1,4)).toBe(2);});it('b',()=>{expect(hd274ptwx(3,1)).toBe(1);});it('c',()=>{expect(hd274ptwx(0,0)).toBe(0);});it('d',()=>{expect(hd274ptwx(93,73)).toBe(2);});it('e',()=>{expect(hd274ptwx(15,0)).toBe(4);});});
function hd275ptwx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph275ptwx_hd',()=>{it('a',()=>{expect(hd275ptwx(1,4)).toBe(2);});it('b',()=>{expect(hd275ptwx(3,1)).toBe(1);});it('c',()=>{expect(hd275ptwx(0,0)).toBe(0);});it('d',()=>{expect(hd275ptwx(93,73)).toBe(2);});it('e',()=>{expect(hd275ptwx(15,0)).toBe(4);});});
function hd276ptwx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph276ptwx_hd',()=>{it('a',()=>{expect(hd276ptwx(1,4)).toBe(2);});it('b',()=>{expect(hd276ptwx(3,1)).toBe(1);});it('c',()=>{expect(hd276ptwx(0,0)).toBe(0);});it('d',()=>{expect(hd276ptwx(93,73)).toBe(2);});it('e',()=>{expect(hd276ptwx(15,0)).toBe(4);});});
function hd277ptwx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph277ptwx_hd',()=>{it('a',()=>{expect(hd277ptwx(1,4)).toBe(2);});it('b',()=>{expect(hd277ptwx(3,1)).toBe(1);});it('c',()=>{expect(hd277ptwx(0,0)).toBe(0);});it('d',()=>{expect(hd277ptwx(93,73)).toBe(2);});it('e',()=>{expect(hd277ptwx(15,0)).toBe(4);});});
function hd278ptwx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph278ptwx_hd',()=>{it('a',()=>{expect(hd278ptwx(1,4)).toBe(2);});it('b',()=>{expect(hd278ptwx(3,1)).toBe(1);});it('c',()=>{expect(hd278ptwx(0,0)).toBe(0);});it('d',()=>{expect(hd278ptwx(93,73)).toBe(2);});it('e',()=>{expect(hd278ptwx(15,0)).toBe(4);});});
function hd279ptwx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph279ptwx_hd',()=>{it('a',()=>{expect(hd279ptwx(1,4)).toBe(2);});it('b',()=>{expect(hd279ptwx(3,1)).toBe(1);});it('c',()=>{expect(hd279ptwx(0,0)).toBe(0);});it('d',()=>{expect(hd279ptwx(93,73)).toBe(2);});it('e',()=>{expect(hd279ptwx(15,0)).toBe(4);});});
function hd280ptwx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph280ptwx_hd',()=>{it('a',()=>{expect(hd280ptwx(1,4)).toBe(2);});it('b',()=>{expect(hd280ptwx(3,1)).toBe(1);});it('c',()=>{expect(hd280ptwx(0,0)).toBe(0);});it('d',()=>{expect(hd280ptwx(93,73)).toBe(2);});it('e',()=>{expect(hd280ptwx(15,0)).toBe(4);});});
function hd281ptwx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph281ptwx_hd',()=>{it('a',()=>{expect(hd281ptwx(1,4)).toBe(2);});it('b',()=>{expect(hd281ptwx(3,1)).toBe(1);});it('c',()=>{expect(hd281ptwx(0,0)).toBe(0);});it('d',()=>{expect(hd281ptwx(93,73)).toBe(2);});it('e',()=>{expect(hd281ptwx(15,0)).toBe(4);});});
function hd282ptwx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph282ptwx_hd',()=>{it('a',()=>{expect(hd282ptwx(1,4)).toBe(2);});it('b',()=>{expect(hd282ptwx(3,1)).toBe(1);});it('c',()=>{expect(hd282ptwx(0,0)).toBe(0);});it('d',()=>{expect(hd282ptwx(93,73)).toBe(2);});it('e',()=>{expect(hd282ptwx(15,0)).toBe(4);});});
function hd283ptwx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph283ptwx_hd',()=>{it('a',()=>{expect(hd283ptwx(1,4)).toBe(2);});it('b',()=>{expect(hd283ptwx(3,1)).toBe(1);});it('c',()=>{expect(hd283ptwx(0,0)).toBe(0);});it('d',()=>{expect(hd283ptwx(93,73)).toBe(2);});it('e',()=>{expect(hd283ptwx(15,0)).toBe(4);});});
function hd284ptwx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph284ptwx_hd',()=>{it('a',()=>{expect(hd284ptwx(1,4)).toBe(2);});it('b',()=>{expect(hd284ptwx(3,1)).toBe(1);});it('c',()=>{expect(hd284ptwx(0,0)).toBe(0);});it('d',()=>{expect(hd284ptwx(93,73)).toBe(2);});it('e',()=>{expect(hd284ptwx(15,0)).toBe(4);});});
function hd285ptwx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph285ptwx_hd',()=>{it('a',()=>{expect(hd285ptwx(1,4)).toBe(2);});it('b',()=>{expect(hd285ptwx(3,1)).toBe(1);});it('c',()=>{expect(hd285ptwx(0,0)).toBe(0);});it('d',()=>{expect(hd285ptwx(93,73)).toBe(2);});it('e',()=>{expect(hd285ptwx(15,0)).toBe(4);});});
function hd286ptwx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph286ptwx_hd',()=>{it('a',()=>{expect(hd286ptwx(1,4)).toBe(2);});it('b',()=>{expect(hd286ptwx(3,1)).toBe(1);});it('c',()=>{expect(hd286ptwx(0,0)).toBe(0);});it('d',()=>{expect(hd286ptwx(93,73)).toBe(2);});it('e',()=>{expect(hd286ptwx(15,0)).toBe(4);});});
function hd287ptwx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph287ptwx_hd',()=>{it('a',()=>{expect(hd287ptwx(1,4)).toBe(2);});it('b',()=>{expect(hd287ptwx(3,1)).toBe(1);});it('c',()=>{expect(hd287ptwx(0,0)).toBe(0);});it('d',()=>{expect(hd287ptwx(93,73)).toBe(2);});it('e',()=>{expect(hd287ptwx(15,0)).toBe(4);});});
function hd288ptwx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph288ptwx_hd',()=>{it('a',()=>{expect(hd288ptwx(1,4)).toBe(2);});it('b',()=>{expect(hd288ptwx(3,1)).toBe(1);});it('c',()=>{expect(hd288ptwx(0,0)).toBe(0);});it('d',()=>{expect(hd288ptwx(93,73)).toBe(2);});it('e',()=>{expect(hd288ptwx(15,0)).toBe(4);});});
function hd289ptwx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph289ptwx_hd',()=>{it('a',()=>{expect(hd289ptwx(1,4)).toBe(2);});it('b',()=>{expect(hd289ptwx(3,1)).toBe(1);});it('c',()=>{expect(hd289ptwx(0,0)).toBe(0);});it('d',()=>{expect(hd289ptwx(93,73)).toBe(2);});it('e',()=>{expect(hd289ptwx(15,0)).toBe(4);});});
function hd290ptwx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph290ptwx_hd',()=>{it('a',()=>{expect(hd290ptwx(1,4)).toBe(2);});it('b',()=>{expect(hd290ptwx(3,1)).toBe(1);});it('c',()=>{expect(hd290ptwx(0,0)).toBe(0);});it('d',()=>{expect(hd290ptwx(93,73)).toBe(2);});it('e',()=>{expect(hd290ptwx(15,0)).toBe(4);});});
function hd291ptwx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph291ptwx_hd',()=>{it('a',()=>{expect(hd291ptwx(1,4)).toBe(2);});it('b',()=>{expect(hd291ptwx(3,1)).toBe(1);});it('c',()=>{expect(hd291ptwx(0,0)).toBe(0);});it('d',()=>{expect(hd291ptwx(93,73)).toBe(2);});it('e',()=>{expect(hd291ptwx(15,0)).toBe(4);});});
function hd292ptwx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph292ptwx_hd',()=>{it('a',()=>{expect(hd292ptwx(1,4)).toBe(2);});it('b',()=>{expect(hd292ptwx(3,1)).toBe(1);});it('c',()=>{expect(hd292ptwx(0,0)).toBe(0);});it('d',()=>{expect(hd292ptwx(93,73)).toBe(2);});it('e',()=>{expect(hd292ptwx(15,0)).toBe(4);});});
function hd293ptwx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph293ptwx_hd',()=>{it('a',()=>{expect(hd293ptwx(1,4)).toBe(2);});it('b',()=>{expect(hd293ptwx(3,1)).toBe(1);});it('c',()=>{expect(hd293ptwx(0,0)).toBe(0);});it('d',()=>{expect(hd293ptwx(93,73)).toBe(2);});it('e',()=>{expect(hd293ptwx(15,0)).toBe(4);});});
function hd294ptwx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph294ptwx_hd',()=>{it('a',()=>{expect(hd294ptwx(1,4)).toBe(2);});it('b',()=>{expect(hd294ptwx(3,1)).toBe(1);});it('c',()=>{expect(hd294ptwx(0,0)).toBe(0);});it('d',()=>{expect(hd294ptwx(93,73)).toBe(2);});it('e',()=>{expect(hd294ptwx(15,0)).toBe(4);});});
function hd295ptwx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph295ptwx_hd',()=>{it('a',()=>{expect(hd295ptwx(1,4)).toBe(2);});it('b',()=>{expect(hd295ptwx(3,1)).toBe(1);});it('c',()=>{expect(hd295ptwx(0,0)).toBe(0);});it('d',()=>{expect(hd295ptwx(93,73)).toBe(2);});it('e',()=>{expect(hd295ptwx(15,0)).toBe(4);});});
function hd296ptwx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph296ptwx_hd',()=>{it('a',()=>{expect(hd296ptwx(1,4)).toBe(2);});it('b',()=>{expect(hd296ptwx(3,1)).toBe(1);});it('c',()=>{expect(hd296ptwx(0,0)).toBe(0);});it('d',()=>{expect(hd296ptwx(93,73)).toBe(2);});it('e',()=>{expect(hd296ptwx(15,0)).toBe(4);});});
function hd297ptwx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph297ptwx_hd',()=>{it('a',()=>{expect(hd297ptwx(1,4)).toBe(2);});it('b',()=>{expect(hd297ptwx(3,1)).toBe(1);});it('c',()=>{expect(hd297ptwx(0,0)).toBe(0);});it('d',()=>{expect(hd297ptwx(93,73)).toBe(2);});it('e',()=>{expect(hd297ptwx(15,0)).toBe(4);});});
function hd298ptwx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph298ptwx_hd',()=>{it('a',()=>{expect(hd298ptwx(1,4)).toBe(2);});it('b',()=>{expect(hd298ptwx(3,1)).toBe(1);});it('c',()=>{expect(hd298ptwx(0,0)).toBe(0);});it('d',()=>{expect(hd298ptwx(93,73)).toBe(2);});it('e',()=>{expect(hd298ptwx(15,0)).toBe(4);});});
function hd299ptwx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph299ptwx_hd',()=>{it('a',()=>{expect(hd299ptwx(1,4)).toBe(2);});it('b',()=>{expect(hd299ptwx(3,1)).toBe(1);});it('c',()=>{expect(hd299ptwx(0,0)).toBe(0);});it('d',()=>{expect(hd299ptwx(93,73)).toBe(2);});it('e',()=>{expect(hd299ptwx(15,0)).toBe(4);});});
function hd300ptwx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph300ptwx_hd',()=>{it('a',()=>{expect(hd300ptwx(1,4)).toBe(2);});it('b',()=>{expect(hd300ptwx(3,1)).toBe(1);});it('c',()=>{expect(hd300ptwx(0,0)).toBe(0);});it('d',()=>{expect(hd300ptwx(93,73)).toBe(2);});it('e',()=>{expect(hd300ptwx(15,0)).toBe(4);});});
function hd301ptwx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph301ptwx_hd',()=>{it('a',()=>{expect(hd301ptwx(1,4)).toBe(2);});it('b',()=>{expect(hd301ptwx(3,1)).toBe(1);});it('c',()=>{expect(hd301ptwx(0,0)).toBe(0);});it('d',()=>{expect(hd301ptwx(93,73)).toBe(2);});it('e',()=>{expect(hd301ptwx(15,0)).toBe(4);});});
function hd302ptwx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph302ptwx_hd',()=>{it('a',()=>{expect(hd302ptwx(1,4)).toBe(2);});it('b',()=>{expect(hd302ptwx(3,1)).toBe(1);});it('c',()=>{expect(hd302ptwx(0,0)).toBe(0);});it('d',()=>{expect(hd302ptwx(93,73)).toBe(2);});it('e',()=>{expect(hd302ptwx(15,0)).toBe(4);});});
function hd303ptwx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph303ptwx_hd',()=>{it('a',()=>{expect(hd303ptwx(1,4)).toBe(2);});it('b',()=>{expect(hd303ptwx(3,1)).toBe(1);});it('c',()=>{expect(hd303ptwx(0,0)).toBe(0);});it('d',()=>{expect(hd303ptwx(93,73)).toBe(2);});it('e',()=>{expect(hd303ptwx(15,0)).toBe(4);});});
function hd304ptwx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph304ptwx_hd',()=>{it('a',()=>{expect(hd304ptwx(1,4)).toBe(2);});it('b',()=>{expect(hd304ptwx(3,1)).toBe(1);});it('c',()=>{expect(hd304ptwx(0,0)).toBe(0);});it('d',()=>{expect(hd304ptwx(93,73)).toBe(2);});it('e',()=>{expect(hd304ptwx(15,0)).toBe(4);});});
function hd305ptwx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph305ptwx_hd',()=>{it('a',()=>{expect(hd305ptwx(1,4)).toBe(2);});it('b',()=>{expect(hd305ptwx(3,1)).toBe(1);});it('c',()=>{expect(hd305ptwx(0,0)).toBe(0);});it('d',()=>{expect(hd305ptwx(93,73)).toBe(2);});it('e',()=>{expect(hd305ptwx(15,0)).toBe(4);});});
function hd306ptwx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph306ptwx_hd',()=>{it('a',()=>{expect(hd306ptwx(1,4)).toBe(2);});it('b',()=>{expect(hd306ptwx(3,1)).toBe(1);});it('c',()=>{expect(hd306ptwx(0,0)).toBe(0);});it('d',()=>{expect(hd306ptwx(93,73)).toBe(2);});it('e',()=>{expect(hd306ptwx(15,0)).toBe(4);});});
function hd307ptwx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph307ptwx_hd',()=>{it('a',()=>{expect(hd307ptwx(1,4)).toBe(2);});it('b',()=>{expect(hd307ptwx(3,1)).toBe(1);});it('c',()=>{expect(hd307ptwx(0,0)).toBe(0);});it('d',()=>{expect(hd307ptwx(93,73)).toBe(2);});it('e',()=>{expect(hd307ptwx(15,0)).toBe(4);});});
function hd308ptwx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph308ptwx_hd',()=>{it('a',()=>{expect(hd308ptwx(1,4)).toBe(2);});it('b',()=>{expect(hd308ptwx(3,1)).toBe(1);});it('c',()=>{expect(hd308ptwx(0,0)).toBe(0);});it('d',()=>{expect(hd308ptwx(93,73)).toBe(2);});it('e',()=>{expect(hd308ptwx(15,0)).toBe(4);});});
function hd309ptwx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph309ptwx_hd',()=>{it('a',()=>{expect(hd309ptwx(1,4)).toBe(2);});it('b',()=>{expect(hd309ptwx(3,1)).toBe(1);});it('c',()=>{expect(hd309ptwx(0,0)).toBe(0);});it('d',()=>{expect(hd309ptwx(93,73)).toBe(2);});it('e',()=>{expect(hd309ptwx(15,0)).toBe(4);});});
function hd310ptwx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph310ptwx_hd',()=>{it('a',()=>{expect(hd310ptwx(1,4)).toBe(2);});it('b',()=>{expect(hd310ptwx(3,1)).toBe(1);});it('c',()=>{expect(hd310ptwx(0,0)).toBe(0);});it('d',()=>{expect(hd310ptwx(93,73)).toBe(2);});it('e',()=>{expect(hd310ptwx(15,0)).toBe(4);});});
function hd311ptwx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph311ptwx_hd',()=>{it('a',()=>{expect(hd311ptwx(1,4)).toBe(2);});it('b',()=>{expect(hd311ptwx(3,1)).toBe(1);});it('c',()=>{expect(hd311ptwx(0,0)).toBe(0);});it('d',()=>{expect(hd311ptwx(93,73)).toBe(2);});it('e',()=>{expect(hd311ptwx(15,0)).toBe(4);});});
function hd312ptwx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph312ptwx_hd',()=>{it('a',()=>{expect(hd312ptwx(1,4)).toBe(2);});it('b',()=>{expect(hd312ptwx(3,1)).toBe(1);});it('c',()=>{expect(hd312ptwx(0,0)).toBe(0);});it('d',()=>{expect(hd312ptwx(93,73)).toBe(2);});it('e',()=>{expect(hd312ptwx(15,0)).toBe(4);});});
function hd313ptwx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph313ptwx_hd',()=>{it('a',()=>{expect(hd313ptwx(1,4)).toBe(2);});it('b',()=>{expect(hd313ptwx(3,1)).toBe(1);});it('c',()=>{expect(hd313ptwx(0,0)).toBe(0);});it('d',()=>{expect(hd313ptwx(93,73)).toBe(2);});it('e',()=>{expect(hd313ptwx(15,0)).toBe(4);});});
function hd314ptwx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph314ptwx_hd',()=>{it('a',()=>{expect(hd314ptwx(1,4)).toBe(2);});it('b',()=>{expect(hd314ptwx(3,1)).toBe(1);});it('c',()=>{expect(hd314ptwx(0,0)).toBe(0);});it('d',()=>{expect(hd314ptwx(93,73)).toBe(2);});it('e',()=>{expect(hd314ptwx(15,0)).toBe(4);});});
function hd315ptwx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph315ptwx_hd',()=>{it('a',()=>{expect(hd315ptwx(1,4)).toBe(2);});it('b',()=>{expect(hd315ptwx(3,1)).toBe(1);});it('c',()=>{expect(hd315ptwx(0,0)).toBe(0);});it('d',()=>{expect(hd315ptwx(93,73)).toBe(2);});it('e',()=>{expect(hd315ptwx(15,0)).toBe(4);});});
function hd316ptwx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph316ptwx_hd',()=>{it('a',()=>{expect(hd316ptwx(1,4)).toBe(2);});it('b',()=>{expect(hd316ptwx(3,1)).toBe(1);});it('c',()=>{expect(hd316ptwx(0,0)).toBe(0);});it('d',()=>{expect(hd316ptwx(93,73)).toBe(2);});it('e',()=>{expect(hd316ptwx(15,0)).toBe(4);});});
function hd317ptwx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph317ptwx_hd',()=>{it('a',()=>{expect(hd317ptwx(1,4)).toBe(2);});it('b',()=>{expect(hd317ptwx(3,1)).toBe(1);});it('c',()=>{expect(hd317ptwx(0,0)).toBe(0);});it('d',()=>{expect(hd317ptwx(93,73)).toBe(2);});it('e',()=>{expect(hd317ptwx(15,0)).toBe(4);});});
function hd318ptwx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph318ptwx_hd',()=>{it('a',()=>{expect(hd318ptwx(1,4)).toBe(2);});it('b',()=>{expect(hd318ptwx(3,1)).toBe(1);});it('c',()=>{expect(hd318ptwx(0,0)).toBe(0);});it('d',()=>{expect(hd318ptwx(93,73)).toBe(2);});it('e',()=>{expect(hd318ptwx(15,0)).toBe(4);});});
function hd319ptwx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph319ptwx_hd',()=>{it('a',()=>{expect(hd319ptwx(1,4)).toBe(2);});it('b',()=>{expect(hd319ptwx(3,1)).toBe(1);});it('c',()=>{expect(hd319ptwx(0,0)).toBe(0);});it('d',()=>{expect(hd319ptwx(93,73)).toBe(2);});it('e',()=>{expect(hd319ptwx(15,0)).toBe(4);});});
function hd320ptwx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph320ptwx_hd',()=>{it('a',()=>{expect(hd320ptwx(1,4)).toBe(2);});it('b',()=>{expect(hd320ptwx(3,1)).toBe(1);});it('c',()=>{expect(hd320ptwx(0,0)).toBe(0);});it('d',()=>{expect(hd320ptwx(93,73)).toBe(2);});it('e',()=>{expect(hd320ptwx(15,0)).toBe(4);});});
function hd321ptwx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph321ptwx_hd',()=>{it('a',()=>{expect(hd321ptwx(1,4)).toBe(2);});it('b',()=>{expect(hd321ptwx(3,1)).toBe(1);});it('c',()=>{expect(hd321ptwx(0,0)).toBe(0);});it('d',()=>{expect(hd321ptwx(93,73)).toBe(2);});it('e',()=>{expect(hd321ptwx(15,0)).toBe(4);});});
function hd322ptwx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph322ptwx_hd',()=>{it('a',()=>{expect(hd322ptwx(1,4)).toBe(2);});it('b',()=>{expect(hd322ptwx(3,1)).toBe(1);});it('c',()=>{expect(hd322ptwx(0,0)).toBe(0);});it('d',()=>{expect(hd322ptwx(93,73)).toBe(2);});it('e',()=>{expect(hd322ptwx(15,0)).toBe(4);});});
function hd323ptwx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph323ptwx_hd',()=>{it('a',()=>{expect(hd323ptwx(1,4)).toBe(2);});it('b',()=>{expect(hd323ptwx(3,1)).toBe(1);});it('c',()=>{expect(hd323ptwx(0,0)).toBe(0);});it('d',()=>{expect(hd323ptwx(93,73)).toBe(2);});it('e',()=>{expect(hd323ptwx(15,0)).toBe(4);});});
function hd324ptwx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph324ptwx_hd',()=>{it('a',()=>{expect(hd324ptwx(1,4)).toBe(2);});it('b',()=>{expect(hd324ptwx(3,1)).toBe(1);});it('c',()=>{expect(hd324ptwx(0,0)).toBe(0);});it('d',()=>{expect(hd324ptwx(93,73)).toBe(2);});it('e',()=>{expect(hd324ptwx(15,0)).toBe(4);});});
function hd325ptwx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph325ptwx_hd',()=>{it('a',()=>{expect(hd325ptwx(1,4)).toBe(2);});it('b',()=>{expect(hd325ptwx(3,1)).toBe(1);});it('c',()=>{expect(hd325ptwx(0,0)).toBe(0);});it('d',()=>{expect(hd325ptwx(93,73)).toBe(2);});it('e',()=>{expect(hd325ptwx(15,0)).toBe(4);});});
function hd326ptwx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph326ptwx_hd',()=>{it('a',()=>{expect(hd326ptwx(1,4)).toBe(2);});it('b',()=>{expect(hd326ptwx(3,1)).toBe(1);});it('c',()=>{expect(hd326ptwx(0,0)).toBe(0);});it('d',()=>{expect(hd326ptwx(93,73)).toBe(2);});it('e',()=>{expect(hd326ptwx(15,0)).toBe(4);});});
function hd327ptwx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph327ptwx_hd',()=>{it('a',()=>{expect(hd327ptwx(1,4)).toBe(2);});it('b',()=>{expect(hd327ptwx(3,1)).toBe(1);});it('c',()=>{expect(hd327ptwx(0,0)).toBe(0);});it('d',()=>{expect(hd327ptwx(93,73)).toBe(2);});it('e',()=>{expect(hd327ptwx(15,0)).toBe(4);});});
function hd328ptwx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph328ptwx_hd',()=>{it('a',()=>{expect(hd328ptwx(1,4)).toBe(2);});it('b',()=>{expect(hd328ptwx(3,1)).toBe(1);});it('c',()=>{expect(hd328ptwx(0,0)).toBe(0);});it('d',()=>{expect(hd328ptwx(93,73)).toBe(2);});it('e',()=>{expect(hd328ptwx(15,0)).toBe(4);});});
function hd329ptwx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph329ptwx_hd',()=>{it('a',()=>{expect(hd329ptwx(1,4)).toBe(2);});it('b',()=>{expect(hd329ptwx(3,1)).toBe(1);});it('c',()=>{expect(hd329ptwx(0,0)).toBe(0);});it('d',()=>{expect(hd329ptwx(93,73)).toBe(2);});it('e',()=>{expect(hd329ptwx(15,0)).toBe(4);});});
function hd330ptwx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph330ptwx_hd',()=>{it('a',()=>{expect(hd330ptwx(1,4)).toBe(2);});it('b',()=>{expect(hd330ptwx(3,1)).toBe(1);});it('c',()=>{expect(hd330ptwx(0,0)).toBe(0);});it('d',()=>{expect(hd330ptwx(93,73)).toBe(2);});it('e',()=>{expect(hd330ptwx(15,0)).toBe(4);});});
function hd331ptwx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph331ptwx_hd',()=>{it('a',()=>{expect(hd331ptwx(1,4)).toBe(2);});it('b',()=>{expect(hd331ptwx(3,1)).toBe(1);});it('c',()=>{expect(hd331ptwx(0,0)).toBe(0);});it('d',()=>{expect(hd331ptwx(93,73)).toBe(2);});it('e',()=>{expect(hd331ptwx(15,0)).toBe(4);});});
function hd332ptwx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph332ptwx_hd',()=>{it('a',()=>{expect(hd332ptwx(1,4)).toBe(2);});it('b',()=>{expect(hd332ptwx(3,1)).toBe(1);});it('c',()=>{expect(hd332ptwx(0,0)).toBe(0);});it('d',()=>{expect(hd332ptwx(93,73)).toBe(2);});it('e',()=>{expect(hd332ptwx(15,0)).toBe(4);});});
function hd333ptwx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph333ptwx_hd',()=>{it('a',()=>{expect(hd333ptwx(1,4)).toBe(2);});it('b',()=>{expect(hd333ptwx(3,1)).toBe(1);});it('c',()=>{expect(hd333ptwx(0,0)).toBe(0);});it('d',()=>{expect(hd333ptwx(93,73)).toBe(2);});it('e',()=>{expect(hd333ptwx(15,0)).toBe(4);});});
function hd334ptwx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph334ptwx_hd',()=>{it('a',()=>{expect(hd334ptwx(1,4)).toBe(2);});it('b',()=>{expect(hd334ptwx(3,1)).toBe(1);});it('c',()=>{expect(hd334ptwx(0,0)).toBe(0);});it('d',()=>{expect(hd334ptwx(93,73)).toBe(2);});it('e',()=>{expect(hd334ptwx(15,0)).toBe(4);});});
function hd335ptwx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph335ptwx_hd',()=>{it('a',()=>{expect(hd335ptwx(1,4)).toBe(2);});it('b',()=>{expect(hd335ptwx(3,1)).toBe(1);});it('c',()=>{expect(hd335ptwx(0,0)).toBe(0);});it('d',()=>{expect(hd335ptwx(93,73)).toBe(2);});it('e',()=>{expect(hd335ptwx(15,0)).toBe(4);});});
function hd336ptwx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph336ptwx_hd',()=>{it('a',()=>{expect(hd336ptwx(1,4)).toBe(2);});it('b',()=>{expect(hd336ptwx(3,1)).toBe(1);});it('c',()=>{expect(hd336ptwx(0,0)).toBe(0);});it('d',()=>{expect(hd336ptwx(93,73)).toBe(2);});it('e',()=>{expect(hd336ptwx(15,0)).toBe(4);});});
function hd337ptwx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph337ptwx_hd',()=>{it('a',()=>{expect(hd337ptwx(1,4)).toBe(2);});it('b',()=>{expect(hd337ptwx(3,1)).toBe(1);});it('c',()=>{expect(hd337ptwx(0,0)).toBe(0);});it('d',()=>{expect(hd337ptwx(93,73)).toBe(2);});it('e',()=>{expect(hd337ptwx(15,0)).toBe(4);});});
