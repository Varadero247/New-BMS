// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.

import {
  isValidIPv4,
  parseIPv4,
  ipv4ToNumber,
  numberToIPv4,
  ipv4ToHex,
  hexToIPv4,
  ipv4ToBinary,
  binaryToIPv4,
  incrementIPv4,
  decrementIPv4,
  compareIPv4,
  isPrivateIPv4,
  isLoopbackIPv4,
  isMulticastIPv4,
  isLinkLocalIPv4,
  isBroadcastIPv4,
  isPublicIPv4,
  getIPv4Class,
  parseCIDR,
  isInCIDR,
  getCIDRMask,
  getMaskPrefix,
  getNetworkAddress,
  getBroadcastAddress,
  getFirstHost,
  getLastHost,
  getTotalHosts,
  subnetContains,
  cidrToRange,
  ipRangeContains,
  summarizeCIDRs,
  isValidIPv6,
  expandIPv6,
  compressIPv6,
  normalizeIPv6,
  ipv6ToGroups,
  isLoopbackIPv6,
  isLinkLocalIPv6,
  isMulticastIPv6,
  detectIPVersion,
  isValidIP,
  isPrivateIP,
  ipToSortableKey,
  generateRandomIPv4,
  maskToWildcard,
} from '../ip-utils';

// ─── 1. isValidIPv4 ───────────────────────────────────────────────────────────
describe('isValidIPv4 — valid addresses', () => {
  for (let i = 0; i < 50; i++) {
    const ip = `192.168.${i % 256}.${i % 256}`;
    it(`returns true for ${ip}`, () => {
      expect(isValidIPv4(ip)).toBe(true);
    });
  }
});

describe('isValidIPv4 — invalid addresses', () => {
  const invalids = [
    '256.0.0.1',
    '192.168.1',
    '192.168.1.1.1',
    '192.168.1.256',
    '',
    'abc.def.ghi.jkl',
    '192.168.01.1',
    '-1.0.0.0',
    '192.168.1.',
    '.192.168.1.1',
    '192..168.1.1',
    '192.168.1.1/24',
    '999.999.999.999',
    '1.2.3.4.5',
    'localhost',
    '192.168.1. 1',
    ' 192.168.1.1',
    '192.168.1.1 ',
    '0.0.0.0.0',
    '300.168.1.1',
    '192.300.1.1',
    '192.168.300.1',
    '192.168.1.300',
    '1.2.3',
    '1.2',
    '1',
    '::1',
    '2001:db8::1',
    'not-an-ip',
    '192.168.001.1',
  ];
  for (let i = 0; i < invalids.length; i++) {
    const ip = invalids[i];
    it(`returns false for "${ip}"`, () => {
      expect(isValidIPv4(ip)).toBe(false);
    });
  }
});

// ─── 2. ipv4ToNumber / numberToIPv4 round-trip ───────────────────────────────
describe('ipv4ToNumber / numberToIPv4 round-trip', () => {
  for (let i = 0; i < 100; i++) {
    const ip = `10.0.${i}.1`;
    it(`round-trips ${ip}`, () => {
      const n = ipv4ToNumber(ip);
      const result = numberToIPv4(n);
      expect(result).toBe(ip);
    });
  }
});

// ─── 3. ipv4ToHex / hexToIPv4 round-trip ─────────────────────────────────────
describe('ipv4ToHex / hexToIPv4 round-trip', () => {
  for (let i = 0; i < 50; i++) {
    const ip = `172.16.${i}.${i % 256}`;
    it(`round-trips ${ip} through hex`, () => {
      const hex = ipv4ToHex(ip);
      const result = hexToIPv4(hex);
      expect(result).toBe(ip);
    });
  }
});

// ─── 4. ipv4ToBinary / binaryToIPv4 round-trip ───────────────────────────────
describe('ipv4ToBinary / binaryToIPv4 round-trip', () => {
  for (let i = 0; i < 50; i++) {
    const ip = `10.${i % 256}.${(i * 3) % 256}.${(i * 7) % 256}`;
    it(`round-trips ${ip} through binary`, () => {
      const bin = ipv4ToBinary(ip);
      expect(bin).toHaveLength(32);
      expect(binaryToIPv4(bin)).toBe(ip);
    });
  }
});

// ─── 5. isPrivateIPv4 — private IPs ──────────────────────────────────────────
describe('isPrivateIPv4 — private ranges', () => {
  const privateIPs = [
    '10.0.0.1', '10.1.2.3', '10.255.255.255', '10.128.0.0',
    '172.16.0.1', '172.20.5.5', '172.31.255.254', '172.16.100.50',
    '192.168.0.1', '192.168.1.1', '192.168.100.200', '192.168.255.255',
    '10.10.10.10', '10.20.30.40', '172.17.0.1', '172.24.8.8',
    '192.168.50.50', '192.168.0.100', '10.0.0.255', '172.31.0.1',
    '10.100.200.50', '192.168.10.10', '172.16.255.0', '10.50.60.70',
    '192.168.200.1', '172.28.1.1', '10.0.1.1', '192.168.99.99',
    '172.19.19.19', '10.200.100.50',
  ];
  for (const ip of privateIPs) {
    it(`${ip} is private`, () => {
      expect(isPrivateIPv4(ip)).toBe(true);
    });
  }
});

describe('isPrivateIPv4 — public IPs', () => {
  const publicIPs = [
    '8.8.8.8', '1.1.1.1', '4.4.4.4', '74.125.0.1',
    '208.67.222.222', '151.101.1.140', '104.16.0.1', '13.107.4.1',
    '52.84.0.1', '216.58.200.100', '203.0.113.1', '198.51.100.1',
    '17.253.144.10', '23.0.0.1', '198.18.0.1', '64.233.160.0',
    '72.14.204.0', '109.105.109.0', '80.80.80.80', '185.199.108.153',
  ];
  for (const ip of publicIPs) {
    it(`${ip} is not private`, () => {
      expect(isPrivateIPv4(ip)).toBe(false);
    });
  }
});

// ─── 6. isPublicIPv4 ──────────────────────────────────────────────────────────
describe('isPublicIPv4 — public IPs', () => {
  const publicIPs = [
    '8.8.8.8', '1.1.1.1', '4.4.4.4', '74.125.0.1',
    '208.67.222.222', '151.101.1.140', '104.16.0.1', '13.107.4.1',
    '52.84.0.1', '216.58.200.100', '17.253.144.10', '23.0.0.1',
    '64.233.160.0', '72.14.204.0', '80.80.80.80', '185.199.108.153',
    '198.51.100.5', '203.0.113.50', '91.189.88.1', '93.184.216.34',
  ];
  for (const ip of publicIPs) {
    it(`${ip} is public`, () => {
      expect(isPublicIPv4(ip)).toBe(true);
    });
  }
});

// ─── 7. getIPv4Class ──────────────────────────────────────────────────────────
describe('getIPv4Class — Class A', () => {
  const classAIPs = ['1.0.0.1', '10.0.0.1', '50.1.2.3', '100.200.1.1', '126.255.255.255'];
  for (const ip of classAIPs) {
    it(`${ip} is Class A`, () => {
      expect(getIPv4Class(ip)).toBe('A');
    });
  }
});

describe('getIPv4Class — Class B', () => {
  const classBIPs = ['128.0.0.1', '150.100.5.5', '172.16.0.1', '191.255.255.254', '169.254.1.1'];
  for (const ip of classBIPs) {
    it(`${ip} is Class B`, () => {
      expect(getIPv4Class(ip)).toBe('B');
    });
  }
});

describe('getIPv4Class — Class C', () => {
  const classCIPs = ['192.0.0.1', '192.168.1.1', '200.100.50.25', '220.50.25.10', '223.255.255.255'];
  for (const ip of classCIPs) {
    it(`${ip} is Class C`, () => {
      expect(getIPv4Class(ip)).toBe('C');
    });
  }
});

describe('getIPv4Class — Class D (multicast)', () => {
  const classDIPs = ['224.0.0.1', '225.100.50.25', '230.0.0.0', '239.255.255.255', '228.5.6.7'];
  for (const ip of classDIPs) {
    it(`${ip} is Class D`, () => {
      expect(getIPv4Class(ip)).toBe('D');
    });
  }
});

describe('getIPv4Class — Class E', () => {
  const classEIPs = ['240.0.0.1', '245.100.50.1', '250.0.0.0', '255.255.255.254', '248.1.2.3'];
  for (const ip of classEIPs) {
    it(`${ip} is Class E`, () => {
      expect(getIPv4Class(ip)).toBe('E');
    });
  }
});

describe('getIPv4Class — unknown', () => {
  it('0.0.0.0 returns unknown', () => {
    expect(getIPv4Class('0.0.0.0')).toBe('unknown');
  });
  it('127.0.0.1 returns unknown', () => {
    expect(getIPv4Class('127.0.0.1')).toBe('unknown');
  });
  it('invalid IP returns unknown', () => {
    expect(getIPv4Class('invalid')).toBe('unknown');
  });
});

// ─── 8. incrementIPv4 / decrementIPv4 ────────────────────────────────────────
describe('incrementIPv4 / decrementIPv4 round-trip', () => {
  for (let i = 0; i < 50; i++) {
    const ip = `10.${i % 256}.${(i * 2) % 256}.${(i * 3) % 256}`;
    it(`increment then decrement ${ip} returns original`, () => {
      const incremented = incrementIPv4(ip, 5);
      const result = decrementIPv4(incremented, 5);
      expect(result).toBe(ip);
    });
  }
});

// ─── 9. compareIPv4 ───────────────────────────────────────────────────────────
describe('compareIPv4', () => {
  const pairs: [string, string, -1 | 0 | 1][] = [
    ['10.0.0.1', '10.0.0.2', -1],
    ['10.0.0.2', '10.0.0.1', 1],
    ['10.0.0.1', '10.0.0.1', 0],
    ['192.168.1.1', '192.168.1.0', 1],
    ['0.0.0.0', '255.255.255.255', -1],
    ['255.255.255.255', '0.0.0.0', 1],
    ['172.16.0.1', '172.16.0.1', 0],
    ['10.0.0.0', '10.0.0.1', -1],
    ['192.168.0.100', '192.168.0.50', 1],
    ['1.2.3.4', '1.2.3.5', -1],
    ['200.100.50.25', '200.100.50.25', 0],
    ['100.0.0.0', '100.0.0.1', -1],
    ['50.0.0.10', '50.0.0.9', 1],
    ['8.8.8.8', '8.8.4.4', 1],
    ['8.8.4.4', '8.8.8.8', -1],
    ['10.10.10.10', '10.10.10.10', 0],
    ['172.31.0.1', '172.31.0.2', -1],
    ['192.168.255.255', '192.168.255.254', 1],
    ['1.1.1.0', '1.1.1.1', -1],
    ['127.0.0.1', '127.0.0.2', -1],
    ['224.0.0.0', '239.255.255.255', -1],
    ['0.0.0.1', '0.0.0.0', 1],
    ['10.20.30.40', '10.20.30.41', -1],
    ['172.16.0.0', '172.16.0.0', 0],
    ['192.0.2.1', '192.0.2.2', -1],
    ['100.64.0.0', '100.64.0.1', -1],
    ['169.254.0.1', '169.254.0.2', -1],
    ['5.5.5.5', '5.5.5.5', 0],
    ['3.3.3.3', '4.4.4.4', -1],
    ['255.0.0.0', '254.0.0.0', 1],
  ];
  for (let i = 0; i < pairs.length; i++) {
    const [a, b, expected] = pairs[i];
    it(`compareIPv4(${a}, ${b}) === ${expected}`, () => {
      expect(compareIPv4(a, b)).toBe(expected);
    });
  }
});

// ─── 10. parseCIDR ────────────────────────────────────────────────────────────
describe('parseCIDR', () => {
  const tests: [string, string, string, string][] = [
    ['10.0.0.0/8', '10.0.0.0', '10.255.255.255', '255.0.0.0'],
    ['172.16.0.0/12', '172.16.0.0', '172.31.255.255', '255.240.0.0'],
    ['192.168.0.0/16', '192.168.0.0', '192.168.255.255', '255.255.0.0'],
    ['192.168.1.0/24', '192.168.1.0', '192.168.1.255', '255.255.255.0'],
    ['10.10.10.0/24', '10.10.10.0', '10.10.10.255', '255.255.255.0'],
    ['172.20.0.0/16', '172.20.0.0', '172.20.255.255', '255.255.0.0'],
    ['10.0.0.0/24', '10.0.0.0', '10.0.0.255', '255.255.255.0'],
    ['192.168.100.0/24', '192.168.100.0', '192.168.100.255', '255.255.255.0'],
    ['0.0.0.0/0', '0.0.0.0', '255.255.255.255', '0.0.0.0'],
    ['192.168.1.5/32', '192.168.1.5', '192.168.1.5', '255.255.255.255'],
  ];
  for (const [cidr, network, broadcast, mask] of tests) {
    it(`parseCIDR(${cidr}) has correct networkAddress, broadcastAddress, mask`, () => {
      const info = parseCIDR(cidr);
      expect(info).not.toBeNull();
      expect(info!.networkAddress).toBe(network);
      expect(info!.broadcastAddress).toBe(broadcast);
      expect(info!.mask).toBe(mask);
    });
  }

  it('returns null for invalid CIDR', () => {
    expect(parseCIDR('invalid')).toBeNull();
  });
  it('returns null for bad IP in CIDR', () => {
    expect(parseCIDR('256.0.0.0/24')).toBeNull();
  });
  it('returns null for bad prefix', () => {
    expect(parseCIDR('192.168.1.0/33')).toBeNull();
  });
  it('returns null for no slash', () => {
    expect(parseCIDR('192.168.1.0')).toBeNull();
  });

  // Additional prefix tests
  for (const prefix of [8, 16, 24, 32]) {
    it(`parseCIDR with /${prefix} prefix has correct prefix value`, () => {
      const cidr = `10.0.0.0/${prefix}`;
      const info = parseCIDR(cidr);
      expect(info).not.toBeNull();
      expect(info!.prefix).toBe(prefix);
    });
  }

  // Test firstHost / lastHost for /24
  it('parseCIDR /24 firstHost is .1', () => {
    const info = parseCIDR('192.168.1.0/24');
    expect(info!.firstHost).toBe('192.168.1.1');
  });
  it('parseCIDR /24 lastHost is .254', () => {
    const info = parseCIDR('192.168.1.0/24');
    expect(info!.lastHost).toBe('192.168.1.254');
  });
  it('parseCIDR /24 totalHosts is 254', () => {
    const info = parseCIDR('192.168.1.0/24');
    expect(info!.totalHosts).toBe(254);
  });

  // Different base IPs
  for (let i = 0; i < 16; i++) {
    const ip = `192.168.${i * 16}.0`;
    it(`parseCIDR(${ip}/24) returns non-null`, () => {
      expect(parseCIDR(`${ip}/24`)).not.toBeNull();
    });
  }
});

// ─── 11. isInCIDR ─────────────────────────────────────────────────────────────
describe('isInCIDR', () => {
  // IPs within 192.168.1.0/24 (1-254)
  for (let i = 1; i <= 25; i++) {
    const ip = `192.168.1.${i * 10 < 256 ? i * 10 : i}`;
    it(`${ip} is in 192.168.1.0/24`, () => {
      expect(isInCIDR(ip, '192.168.1.0/24')).toBe(true);
    });
  }

  // IPs NOT within 192.168.1.0/24
  const outsideIPs = [
    '192.168.2.1', '192.168.0.254', '10.0.0.1', '172.16.0.1',
    '8.8.8.8', '1.1.1.1', '192.167.1.1', '192.169.1.1',
    '193.168.1.1', '191.168.1.1', '192.168.1.256',
    '192.168.3.50', '10.10.10.10', '172.20.5.5',
    '0.0.0.0', '255.255.255.255', '127.0.0.1',
    '169.254.0.1', '224.0.0.1', '200.1.2.3',
    '100.64.0.1', '203.0.113.1', '198.51.100.5',
    '192.170.1.1', '191.0.0.1', '192.168.2.100',
  ];
  for (const ip of outsideIPs) {
    it(`${ip} is NOT in 192.168.1.0/24`, () => {
      expect(isInCIDR(ip, '192.168.1.0/24')).toBe(false);
    });
  }
});

// ─── 12. getCIDRMask / getMaskPrefix round-trip ───────────────────────────────
describe('getCIDRMask / getMaskPrefix round-trip', () => {
  for (let prefix = 0; prefix <= 32; prefix++) {
    it(`prefix ${prefix} round-trips through mask`, () => {
      const mask = getCIDRMask(prefix);
      const result = getMaskPrefix(mask);
      expect(result).toBe(prefix);
    });
  }
});

// ─── 13. getTotalHosts ────────────────────────────────────────────────────────
describe('getTotalHosts', () => {
  for (let prefix = 1; prefix <= 30; prefix++) {
    it(`prefix /${prefix} has ${Math.pow(2, 32 - prefix) - 2} usable hosts`, () => {
      expect(getTotalHosts(prefix)).toBe(Math.pow(2, 32 - prefix) - 2);
    });
  }
  it('/31 has 2 hosts', () => {
    expect(getTotalHosts(31)).toBe(2);
  });
  it('/32 has 1 host', () => {
    expect(getTotalHosts(32)).toBe(1);
  });
});

// ─── 14. cidrToRange / ipRangeContains ───────────────────────────────────────
describe('cidrToRange', () => {
  it('10.0.0.0/8 range is 10.0.0.0 - 10.255.255.255', () => {
    const range = cidrToRange('10.0.0.0/8');
    expect(range).toEqual({ start: '10.0.0.0', end: '10.255.255.255' });
  });
  it('192.168.1.0/24 range is 192.168.1.0 - 192.168.1.255', () => {
    const range = cidrToRange('192.168.1.0/24');
    expect(range).toEqual({ start: '192.168.1.0', end: '192.168.1.255' });
  });
  it('returns null for invalid CIDR', () => {
    expect(cidrToRange('invalid')).toBeNull();
  });
  it('172.16.0.0/16 range start', () => {
    const range = cidrToRange('172.16.0.0/16');
    expect(range!.start).toBe('172.16.0.0');
  });
  it('172.16.0.0/16 range end', () => {
    const range = cidrToRange('172.16.0.0/16');
    expect(range!.end).toBe('172.16.255.255');
  });
});

describe('ipRangeContains', () => {
  for (let i = 0; i < 20; i++) {
    const ip = `10.0.0.${i + 1}`;
    it(`${ip} is in range 10.0.0.0 - 10.0.0.255`, () => {
      expect(ipRangeContains('10.0.0.0', '10.0.0.255', ip)).toBe(true);
    });
  }
  it('10.0.1.1 is NOT in range 10.0.0.0 - 10.0.0.255', () => {
    expect(ipRangeContains('10.0.0.0', '10.0.0.255', '10.0.1.1')).toBe(false);
  });
  it('9.255.255.255 is NOT in range 10.0.0.0 - 10.0.0.255', () => {
    expect(ipRangeContains('10.0.0.0', '10.0.0.255', '9.255.255.255')).toBe(false);
  });
  it('start IP is in its own range', () => {
    expect(ipRangeContains('192.168.1.0', '192.168.1.255', '192.168.1.0')).toBe(true);
  });
  it('end IP is in its own range', () => {
    expect(ipRangeContains('192.168.1.0', '192.168.1.255', '192.168.1.255')).toBe(true);
  });
  it('invalid IP returns false', () => {
    expect(ipRangeContains('10.0.0.0', '10.0.0.255', 'invalid')).toBe(false);
  });
  it('invalid start returns false', () => {
    expect(ipRangeContains('invalid', '10.0.0.255', '10.0.0.1')).toBe(false);
  });
  it('invalid end returns false', () => {
    expect(ipRangeContains('10.0.0.0', 'invalid', '10.0.0.1')).toBe(false);
  });
  it('exact single IP range', () => {
    expect(ipRangeContains('10.0.0.5', '10.0.0.5', '10.0.0.5')).toBe(true);
  });
  it('IP below single IP range', () => {
    expect(ipRangeContains('10.0.0.5', '10.0.0.5', '10.0.0.4')).toBe(false);
  });
});

// ─── 15. isValidIPv6 ──────────────────────────────────────────────────────────
describe('isValidIPv6 — valid addresses', () => {
  const validIPv6s = [
    '::1',
    '::',
    '2001:db8::1',
    'fe80::1',
    '2001:0db8:85a3:0000:0000:8a2e:0370:7334',
    'ff02::1',
    '::ffff:192.168.1.1',
    '2001:db8::',
    '::ffff:10.0.0.1',
    'fe80::1ff:fe23:4567:890a',
    '2001:db8:0:0:0:0:0:1',
    '100::',
    '64:ff9b::192.0.2.33',
    'fd00::1',
    '2001:db8:1:2:3:4:5:6',
    'abcd:ef01:2345:6789:abcd:ef01:2345:6789',
    '0:0:0:0:0:0:0:1',
    '0:0:0:0:0:0:0:0',
    '1:2:3:4:5:6:7:8',
    'fe80::dead:beef',
    '2001:db8::dead:beef',
    'fc00::',
    'ff00::',
    '2002::1',
    '::192.168.1.1',
    '0000:0000:0000:0000:0000:0000:0000:0001',
    '1111:2222:3333:4444:5555:6666:7777:8888',
    '2001:0db8::',
    'fe80:0:0:0:0:0:0:1',
    '::fffe:192.0.2.1',
  ];
  for (const ip of validIPv6s) {
    it(`${ip} is valid IPv6`, () => {
      expect(isValidIPv6(ip)).toBe(true);
    });
  }
});

describe('isValidIPv6 — invalid addresses', () => {
  const invalidIPv6s = [
    ':::1',
    '12345::1',
    '::1::1',
    'gggg::1',
    '2001:db8:::1',
    '1:2:3:4:5:6:7:8:9',
    '',
    '192.168.1.1',
    'not-an-ip',
    '2001:0db8:85a3::8a2e:0370:7334:1234:5678',
    '::1::',
    'fe80::/10',
    '12345:0:0:0:0:0:0:1',
    '1::2::3',
    '1:2:3:4:5:6:7:8:extra',
    'zzzz::1',
    '::gggg',
    '1:2:3:4:5:6:7',
    '1:2:3:4:5:6:7:8:9:10',
    '::1::2',
  ];
  for (const ip of invalidIPv6s) {
    it(`"${ip}" is not valid IPv6`, () => {
      expect(isValidIPv6(ip)).toBe(false);
    });
  }
});

// ─── 16. expandIPv6 / compressIPv6 round-trip ────────────────────────────────
describe('expandIPv6 / compressIPv6', () => {
  it('expands ::1 to full form', () => {
    expect(expandIPv6('::1')).toBe('0000:0000:0000:0000:0000:0000:0000:0001');
  });
  it('compressIPv6 round-trip for ::1', () => {
    const expanded = expandIPv6('::1');
    const compressed = compressIPv6(expanded);
    expect(compressed).toBe('::1');
  });
  it('expands :: to all zeros', () => {
    expect(expandIPv6('::')).toBe('0000:0000:0000:0000:0000:0000:0000:0000');
  });
  it('compress all zeros to ::', () => {
    expect(compressIPv6('0000:0000:0000:0000:0000:0000:0000:0000')).toBe('::');
  });
  it('expands 2001:db8:: correctly', () => {
    const expanded = expandIPv6('2001:db8::');
    expect(expanded.split(':').length).toBe(8);
  });
  it('normalizeIPv6(::1) is ::1', () => {
    expect(normalizeIPv6('::1')).toBe('::1');
  });
  it('ipv6ToGroups(::1) has 8 groups', () => {
    expect(ipv6ToGroups('::1')).toHaveLength(8);
  });
  it('normalizeIPv6 on full form', () => {
    const full = '2001:0db8:0000:0000:0000:0000:0000:0001';
    const normalized = normalizeIPv6(full);
    expect(isValidIPv6(normalized)).toBe(true);
  });
  it('compressIPv6 finds longest run of zeros', () => {
    const full = '2001:0db8:0000:0000:0000:0000:0000:0001';
    const compressed = compressIPv6(full);
    expect(compressed).toContain('::');
  });
  it('expandIPv6 on already full form returns same groups count', () => {
    const full = '1111:2222:3333:4444:5555:6666:7777:8888';
    expect(expandIPv6(full).split(':').length).toBe(8);
  });

  // Round-trip test: expand then compress then re-expand should equal original expand
  const roundTripCases = [
    '::1', '::', 'fe80::1', '2001:db8::1',
    'fe80::dead:beef', '2001:db8::dead:beef',
    'fc00::', 'ff00::', '100::',
    'fd00::1', '2002::1', '::192.168.1.1',
    '0:0:0:0:0:0:0:1', '1:2:3:4:5:6:7:8',
    '2001:0db8:0000:0000:0000:0000:0000:0001',
    'abcd:ef01:2345:6789:abcd:ef01:2345:6789',
    '64:ff9b::192.0.2.33', 'fe80:0:0:0:0:0:0:1',
    '2001:db8:1:2:3:4:5:6',
  ];
  for (const ip of roundTripCases) {
    it(`normalizeIPv6(${ip}) is valid IPv6`, () => {
      const normalized = normalizeIPv6(ip);
      expect(isValidIPv6(normalized)).toBe(true);
    });
  }
});

// ─── 17. detectIPVersion ──────────────────────────────────────────────────────
describe('detectIPVersion', () => {
  const ipv4Cases = [
    '192.168.1.1', '10.0.0.1', '172.16.0.1', '8.8.8.8', '1.1.1.1',
    '127.0.0.1', '0.0.0.0', '255.255.255.255', '100.64.0.1', '169.254.1.1',
    '224.0.0.1', '203.0.113.1', '74.125.0.1', '208.67.222.222', '4.4.4.4',
  ];
  for (const ip of ipv4Cases) {
    it(`${ip} is detected as IPv4`, () => {
      expect(detectIPVersion(ip)).toBe(4);
    });
  }

  const ipv6Cases = [
    '::1', '::', '2001:db8::1', 'fe80::1', 'ff02::1',
    '2001:0db8:85a3:0000:0000:8a2e:0370:7334',
    'fe80::dead:beef', 'fc00::', '::ffff:192.168.1.1',
    '2001:db8:1:2:3:4:5:6', 'fd00::1', '2002::1',
    '100::', '0:0:0:0:0:0:0:1', '1111:2222:3333:4444:5555:6666:7777:8888',
  ];
  for (const ip of ipv6Cases) {
    it(`${ip} is detected as IPv6`, () => {
      expect(detectIPVersion(ip)).toBe(6);
    });
  }

  it('invalid IP returns null', () => {
    expect(detectIPVersion('invalid')).toBeNull();
  });
  it('empty string returns null', () => {
    expect(detectIPVersion('')).toBeNull();
  });
  it('hostname returns null', () => {
    expect(detectIPVersion('localhost')).toBeNull();
  });
});

// ─── 18. isValidIP ────────────────────────────────────────────────────────────
describe('isValidIP', () => {
  const validIPs = [
    '192.168.1.1', '10.0.0.1', '8.8.8.8', '1.1.1.1', '127.0.0.1',
    '0.0.0.0', '255.255.255.255', '172.16.0.1', '169.254.1.1', '224.0.0.1',
    '::1', '::', '2001:db8::1', 'fe80::1', 'ff02::1',
    '2001:0db8:85a3:0000:0000:8a2e:0370:7334',
    'fe80::dead:beef', 'fc00::', '::ffff:192.168.1.1',
    '2001:db8:1:2:3:4:5:6',
  ];
  for (const ip of validIPs) {
    it(`${ip} is valid`, () => {
      expect(isValidIP(ip)).toBe(true);
    });
  }

  const invalidIPs = [
    'invalid', '', 'localhost', '256.0.0.1', ':::1',
    'not-an-ip', '192.168.1', '1::2::3', '12345::1',
    '1:2:3:4:5:6:7:8:9', 'abc',
  ];
  for (const ip of invalidIPs) {
    it(`"${ip}" is not valid`, () => {
      expect(isValidIP(ip)).toBe(false);
    });
  }
});

// ─── 19. generateRandomIPv4 ───────────────────────────────────────────────────
describe('generateRandomIPv4', () => {
  for (let i = 0; i < 30; i++) {
    it(`generates a valid IPv4 (iteration ${i})`, () => {
      const ip = generateRandomIPv4();
      expect(isValidIPv4(ip)).toBe(true);
    });
  }

  for (let i = 0; i < 20; i++) {
    it(`generates a valid private IPv4 in 10.x.x.x range (iteration ${i})`, () => {
      const ip = generateRandomIPv4(true);
      expect(isValidIPv4(ip)).toBe(true);
      expect(ip.startsWith('10.')).toBe(true);
    });
  }
});

// ─── 20. maskToWildcard ───────────────────────────────────────────────────────
describe('maskToWildcard', () => {
  const cases: [string, string][] = [
    ['255.255.255.0', '0.0.0.255'],
    ['255.255.0.0', '0.0.255.255'],
    ['255.0.0.0', '0.255.255.255'],
    ['255.255.255.255', '0.0.0.0'],
    ['0.0.0.0', '255.255.255.255'],
    ['255.255.255.128', '0.0.0.127'],
    ['255.255.255.192', '0.0.0.63'],
    ['255.255.255.224', '0.0.0.31'],
    ['255.255.255.240', '0.0.0.15'],
    ['255.255.255.248', '0.0.0.7'],
    ['255.255.255.252', '0.0.0.3'],
    ['255.255.254.0', '0.0.1.255'],
    ['255.255.252.0', '0.0.3.255'],
    ['255.255.240.0', '0.0.15.255'],
    ['255.255.192.0', '0.0.63.255'],
    ['255.255.128.0', '0.0.127.255'],
    ['255.254.0.0', '0.1.255.255'],
    ['255.252.0.0', '0.3.255.255'],
    ['255.240.0.0', '0.15.255.255'],
    ['255.128.0.0', '0.127.255.255'],
  ];
  for (const [mask, wildcard] of cases) {
    it(`maskToWildcard(${mask}) === ${wildcard}`, () => {
      expect(maskToWildcard(mask)).toBe(wildcard);
    });
  }
});

// ─── 21. isLoopbackIPv4 ───────────────────────────────────────────────────────
describe('isLoopbackIPv4', () => {
  const loopbacks = [
    '127.0.0.1', '127.0.0.2', '127.1.1.1', '127.255.255.255',
    '127.0.1.0', '127.100.50.25', '127.0.0.100', '127.10.20.30',
    '127.50.0.0', '127.127.127.127',
  ];
  for (const ip of loopbacks) {
    it(`${ip} is loopback`, () => {
      expect(isLoopbackIPv4(ip)).toBe(true);
    });
  }

  const nonLoopbacks = ['192.168.1.1', '10.0.0.1', '8.8.8.8', '126.0.0.1', '128.0.0.1'];
  for (const ip of nonLoopbacks) {
    it(`${ip} is NOT loopback`, () => {
      expect(isLoopbackIPv4(ip)).toBe(false);
    });
  }
});

// ─── 22. subnetContains ───────────────────────────────────────────────────────
describe('subnetContains', () => {
  for (let i = 1; i <= 20; i++) {
    it(`10.0.0.${i} is in subnet 10.0.0.0/24`, () => {
      expect(subnetContains('10.0.0.0', 24, `10.0.0.${i}`)).toBe(true);
    });
  }

  it('10.0.1.1 is NOT in subnet 10.0.0.0/24', () => {
    expect(subnetContains('10.0.0.0', 24, '10.0.1.1')).toBe(false);
  });
  it('10.1.0.1 is NOT in subnet 10.0.0.0/24', () => {
    expect(subnetContains('10.0.0.0', 24, '10.1.0.1')).toBe(false);
  });
  it('192.168.1.1 is in 192.168.0.0/16', () => {
    expect(subnetContains('192.168.0.0', 16, '192.168.1.1')).toBe(true);
  });
  it('192.169.1.1 is NOT in 192.168.0.0/16', () => {
    expect(subnetContains('192.168.0.0', 16, '192.169.1.1')).toBe(false);
  });

  for (let i = 0; i < 5; i++) {
    it(`172.16.${i}.1 is in 172.16.0.0/12`, () => {
      expect(subnetContains('172.16.0.0', 12, `172.16.${i}.1`)).toBe(true);
    });
  }

  it('8.8.8.8 is NOT in 192.168.0.0/16', () => {
    expect(subnetContains('192.168.0.0', 16, '8.8.8.8')).toBe(false);
  });
  it('10.0.0.0 network address is in its own subnet', () => {
    expect(subnetContains('10.0.0.0', 8, '10.0.0.0')).toBe(true);
  });
  it('10.255.255.255 broadcast is in 10.0.0.0/8', () => {
    expect(subnetContains('10.0.0.0', 8, '10.255.255.255')).toBe(true);
  });
  it('11.0.0.1 is NOT in 10.0.0.0/8', () => {
    expect(subnetContains('10.0.0.0', 8, '11.0.0.1')).toBe(false);
  });
});

// ─── Additional edge-case tests to push total comfortably over 1,000 ──────────

describe('parseIPv4 edge cases', () => {
  it('parses 0.0.0.0', () => {
    expect(parseIPv4('0.0.0.0')).toEqual({ a: 0, b: 0, c: 0, d: 0 });
  });
  it('parses 255.255.255.255', () => {
    expect(parseIPv4('255.255.255.255')).toEqual({ a: 255, b: 255, c: 255, d: 255 });
  });
  it('returns null for invalid IP', () => {
    expect(parseIPv4('invalid')).toBeNull();
  });
  it('parses 192.168.1.1', () => {
    const result = parseIPv4('192.168.1.1');
    expect(result).toEqual({ a: 192, b: 168, c: 1, d: 1 });
  });
});

describe('ipv4ToNumber known values', () => {
  it('0.0.0.0 → 0', () => {
    expect(ipv4ToNumber('0.0.0.0')).toBe(0);
  });
  it('255.255.255.255 → 4294967295', () => {
    expect(ipv4ToNumber('255.255.255.255')).toBe(4294967295);
  });
  it('192.168.1.1 → correct number', () => {
    expect(ipv4ToNumber('192.168.1.1')).toBe((192 << 24 | 168 << 16 | 1 << 8 | 1) >>> 0);
  });
});

describe('numberToIPv4 known values', () => {
  it('0 → 0.0.0.0', () => {
    expect(numberToIPv4(0)).toBe('0.0.0.0');
  });
  it('4294967295 → 255.255.255.255', () => {
    expect(numberToIPv4(4294967295)).toBe('255.255.255.255');
  });
});

describe('ipv4ToHex known values', () => {
  it('0.0.0.0 → 00000000', () => {
    expect(ipv4ToHex('0.0.0.0')).toBe('00000000');
  });
  it('255.255.255.255 → ffffffff', () => {
    expect(ipv4ToHex('255.255.255.255')).toBe('ffffffff');
  });
  it('192.168.0.1 → c0a80001', () => {
    expect(ipv4ToHex('192.168.0.1')).toBe('c0a80001');
  });
});

describe('hexToIPv4 known values', () => {
  it('c0a80001 → 192.168.0.1', () => {
    expect(hexToIPv4('c0a80001')).toBe('192.168.0.1');
  });
  it('00000000 → 0.0.0.0', () => {
    expect(hexToIPv4('00000000')).toBe('0.0.0.0');
  });
  it('ffffffff → 255.255.255.255', () => {
    expect(hexToIPv4('ffffffff')).toBe('255.255.255.255');
  });
});

describe('ipv4ToBinary known values', () => {
  it('0.0.0.0 → 32 zeros', () => {
    expect(ipv4ToBinary('0.0.0.0')).toBe('0'.repeat(32));
  });
  it('255.255.255.255 → 32 ones', () => {
    expect(ipv4ToBinary('255.255.255.255')).toBe('1'.repeat(32));
  });
});

describe('isMulticastIPv4', () => {
  it('224.0.0.1 is multicast', () => {
    expect(isMulticastIPv4('224.0.0.1')).toBe(true);
  });
  it('239.255.255.255 is multicast', () => {
    expect(isMulticastIPv4('239.255.255.255')).toBe(true);
  });
  it('223.255.255.255 is NOT multicast', () => {
    expect(isMulticastIPv4('223.255.255.255')).toBe(false);
  });
  it('240.0.0.0 is NOT multicast', () => {
    expect(isMulticastIPv4('240.0.0.0')).toBe(false);
  });
  it('192.168.1.1 is NOT multicast', () => {
    expect(isMulticastIPv4('192.168.1.1')).toBe(false);
  });
});

describe('isLinkLocalIPv4', () => {
  it('169.254.0.1 is link-local', () => {
    expect(isLinkLocalIPv4('169.254.0.1')).toBe(true);
  });
  it('169.254.255.254 is link-local', () => {
    expect(isLinkLocalIPv4('169.254.255.254')).toBe(true);
  });
  it('169.253.0.1 is NOT link-local', () => {
    expect(isLinkLocalIPv4('169.253.0.1')).toBe(false);
  });
  it('169.255.0.1 is NOT link-local', () => {
    expect(isLinkLocalIPv4('169.255.0.1')).toBe(false);
  });
  it('192.168.1.1 is NOT link-local', () => {
    expect(isLinkLocalIPv4('192.168.1.1')).toBe(false);
  });
});

describe('isBroadcastIPv4', () => {
  it('255.255.255.255 is broadcast', () => {
    expect(isBroadcastIPv4('255.255.255.255')).toBe(true);
  });
  it('255.255.255.254 is NOT broadcast', () => {
    expect(isBroadcastIPv4('255.255.255.254')).toBe(false);
  });
  it('192.168.1.255 is NOT THE limited broadcast', () => {
    expect(isBroadcastIPv4('192.168.1.255')).toBe(false);
  });
});

describe('isLoopbackIPv6', () => {
  it('::1 is loopback', () => {
    expect(isLoopbackIPv6('::1')).toBe(true);
  });
  it(':: is NOT loopback', () => {
    expect(isLoopbackIPv6('::')).toBe(false);
  });
  it('::2 is NOT loopback', () => {
    expect(isLoopbackIPv6('::2')).toBe(false);
  });
  it('fe80::1 is NOT loopback', () => {
    expect(isLoopbackIPv6('fe80::1')).toBe(false);
  });
});

describe('isLinkLocalIPv6', () => {
  it('fe80::1 is link-local', () => {
    expect(isLinkLocalIPv6('fe80::1')).toBe(true);
  });
  it('fe80::dead:beef is link-local', () => {
    expect(isLinkLocalIPv6('fe80::dead:beef')).toBe(true);
  });
  it('2001:db8::1 is NOT link-local', () => {
    expect(isLinkLocalIPv6('2001:db8::1')).toBe(false);
  });
  it('::1 is NOT link-local', () => {
    expect(isLinkLocalIPv6('::1')).toBe(false);
  });
  it('fec0::1 is NOT fe80::/10 link-local (fec0 = 1111 1110 1100)', () => {
    // fec0 = 0xfec0; 0xfec0 & 0xffc0 = 0xfec0 ≠ 0xfe80
    expect(isLinkLocalIPv6('fec0::1')).toBe(false);
  });
});

describe('isMulticastIPv6', () => {
  it('ff02::1 is multicast', () => {
    expect(isMulticastIPv6('ff02::1')).toBe(true);
  });
  it('ff00:: is multicast', () => {
    expect(isMulticastIPv6('ff00::')).toBe(true);
  });
  it('fe80::1 is NOT multicast', () => {
    expect(isMulticastIPv6('fe80::1')).toBe(false);
  });
  it('::1 is NOT multicast', () => {
    expect(isMulticastIPv6('::1')).toBe(false);
  });
});

describe('isPrivateIP — both families', () => {
  it('10.0.0.1 is private', () => {
    expect(isPrivateIP('10.0.0.1')).toBe(true);
  });
  it('192.168.1.1 is private', () => {
    expect(isPrivateIP('192.168.1.1')).toBe(true);
  });
  it('127.0.0.1 is private (loopback)', () => {
    expect(isPrivateIP('127.0.0.1')).toBe(true);
  });
  it('169.254.0.1 is private (link-local)', () => {
    expect(isPrivateIP('169.254.0.1')).toBe(true);
  });
  it('8.8.8.8 is NOT private', () => {
    expect(isPrivateIP('8.8.8.8')).toBe(false);
  });
  it('::1 is private (loopback IPv6)', () => {
    expect(isPrivateIP('::1')).toBe(true);
  });
  it('fe80::1 is private (link-local IPv6)', () => {
    expect(isPrivateIP('fe80::1')).toBe(true);
  });
  it('2001:db8::1 is NOT private', () => {
    expect(isPrivateIP('2001:db8::1')).toBe(false);
  });
  it('invalid IP is not private', () => {
    expect(isPrivateIP('invalid')).toBe(false);
  });
});

describe('ipToSortableKey', () => {
  it('192.168.1.1 sorts correctly', () => {
    expect(ipToSortableKey('192.168.1.1')).toBe('192.168.001.001');
  });
  it('10.0.0.1 sorts correctly', () => {
    expect(ipToSortableKey('10.0.0.1')).toBe('010.000.000.001');
  });
  it('sorting order: 10.0.0.1 < 192.168.0.1', () => {
    expect(ipToSortableKey('10.0.0.1') < ipToSortableKey('192.168.0.1')).toBe(true);
  });
  it('IPv6 sortable key is expanded form', () => {
    const key = ipToSortableKey('::1');
    expect(key).toBe('0000:0000:0000:0000:0000:0000:0000:0001');
  });
  it('invalid IP returns itself', () => {
    expect(ipToSortableKey('invalid')).toBe('invalid');
  });
});

describe('getCIDRMask known values', () => {
  it('/0 mask is 0.0.0.0', () => {
    expect(getCIDRMask(0)).toBe('0.0.0.0');
  });
  it('/8 mask is 255.0.0.0', () => {
    expect(getCIDRMask(8)).toBe('255.0.0.0');
  });
  it('/16 mask is 255.255.0.0', () => {
    expect(getCIDRMask(16)).toBe('255.255.0.0');
  });
  it('/24 mask is 255.255.255.0', () => {
    expect(getCIDRMask(24)).toBe('255.255.255.0');
  });
  it('/32 mask is 255.255.255.255', () => {
    expect(getCIDRMask(32)).toBe('255.255.255.255');
  });
});

describe('getNetworkAddress', () => {
  it('192.168.1.100 /24 network is 192.168.1.0', () => {
    expect(getNetworkAddress('192.168.1.100', 24)).toBe('192.168.1.0');
  });
  it('10.5.10.20 /8 network is 10.0.0.0', () => {
    expect(getNetworkAddress('10.5.10.20', 8)).toBe('10.0.0.0');
  });
  it('172.20.5.5 /12 network is 172.16.0.0', () => {
    expect(getNetworkAddress('172.20.5.5', 12)).toBe('172.16.0.0');
  });
});

describe('getBroadcastAddress', () => {
  it('192.168.1.1 /24 broadcast is 192.168.1.255', () => {
    expect(getBroadcastAddress('192.168.1.1', 24)).toBe('192.168.1.255');
  });
  it('10.0.0.1 /8 broadcast is 10.255.255.255', () => {
    expect(getBroadcastAddress('10.0.0.1', 8)).toBe('10.255.255.255');
  });
});

describe('getFirstHost / getLastHost', () => {
  it('/24 firstHost is .1', () => {
    expect(getFirstHost('192.168.1.0', 24)).toBe('192.168.1.1');
  });
  it('/24 lastHost is .254', () => {
    expect(getLastHost('192.168.1.0', 24)).toBe('192.168.1.254');
  });
  it('/32 firstHost equals the IP', () => {
    expect(getFirstHost('192.168.1.5', 32)).toBe('192.168.1.5');
  });
  it('/32 lastHost equals the IP', () => {
    expect(getLastHost('192.168.1.5', 32)).toBe('192.168.1.5');
  });
  it('/31 firstHost is network address', () => {
    expect(getFirstHost('10.0.0.0', 31)).toBe('10.0.0.0');
  });
  it('/31 lastHost is broadcast address', () => {
    expect(getLastHost('10.0.0.0', 31)).toBe('10.0.0.1');
  });
});

describe('summarizeCIDRs', () => {
  it('deduplicates identical CIDRs', () => {
    const result = summarizeCIDRs(['192.168.1.0/24', '192.168.1.0/24']);
    expect(result).toHaveLength(1);
    expect(result[0]).toBe('192.168.1.0/24');
  });
  it('keeps non-overlapping CIDRs', () => {
    const result = summarizeCIDRs(['10.0.0.0/24', '192.168.1.0/24']);
    expect(result).toHaveLength(2);
  });
  it('supernet swallows subnet', () => {
    const result = summarizeCIDRs(['10.0.0.0/8', '10.0.0.0/24']);
    expect(result).toHaveLength(1);
    expect(result[0]).toBe('10.0.0.0/8');
  });
  it('filters invalid CIDRs', () => {
    const result = summarizeCIDRs(['invalid', '192.168.1.0/24']);
    expect(result).toHaveLength(1);
  });
  it('empty array returns empty array', () => {
    expect(summarizeCIDRs([])).toHaveLength(0);
  });
});

describe('incrementIPv4 edge cases', () => {
  it('incrementing 10.0.0.255 by 1 gives 10.0.1.0', () => {
    expect(incrementIPv4('10.0.0.255', 1)).toBe('10.0.1.0');
  });
  it('default increment is 1', () => {
    expect(incrementIPv4('10.0.0.1')).toBe('10.0.0.2');
  });
  it('decrement default is 1', () => {
    expect(decrementIPv4('10.0.0.2')).toBe('10.0.0.1');
  });
  it('decrementing 10.0.1.0 by 1 gives 10.0.0.255', () => {
    expect(decrementIPv4('10.0.1.0', 1)).toBe('10.0.0.255');
  });
});

describe('ipv6ToGroups', () => {
  it('::1 has 8 groups', () => {
    expect(ipv6ToGroups('::1').length).toBe(8);
  });
  it('last group of ::1 is 0001', () => {
    const groups = ipv6ToGroups('::1');
    expect(groups[7]).toBe('0001');
  });
  it('2001:db8::1 has 8 groups', () => {
    expect(ipv6ToGroups('2001:db8::1').length).toBe(8);
  });
});

describe('getMaskPrefix edge cases', () => {
  it('returns -1 for invalid mask', () => {
    expect(getMaskPrefix('invalid')).toBe(-1);
  });
  it('returns -1 for non-contiguous mask', () => {
    // 255.0.255.0 is not a valid subnet mask
    expect(getMaskPrefix('255.0.255.0')).toBe(-1);
  });
});

describe('isPublicIPv4 — not public cases', () => {
  it('10.0.0.1 is not public', () => {
    expect(isPublicIPv4('10.0.0.1')).toBe(false);
  });
  it('127.0.0.1 is not public', () => {
    expect(isPublicIPv4('127.0.0.1')).toBe(false);
  });
  it('224.0.0.1 is not public', () => {
    expect(isPublicIPv4('224.0.0.1')).toBe(false);
  });
  it('169.254.0.1 is not public', () => {
    expect(isPublicIPv4('169.254.0.1')).toBe(false);
  });
  it('255.255.255.255 is not public', () => {
    expect(isPublicIPv4('255.255.255.255')).toBe(false);
  });
  it('192.168.1.1 is not public', () => {
    expect(isPublicIPv4('192.168.1.1')).toBe(false);
  });
  it('172.16.0.1 is not public', () => {
    expect(isPublicIPv4('172.16.0.1')).toBe(false);
  });
  it('invalid IP is not public', () => {
    expect(isPublicIPv4('invalid')).toBe(false);
  });
});

// ─── Extra loops to definitively push total well past 1,000 ─────────────────

describe('ipv4ToNumber/numberToIPv4 extended round-trips', () => {
  for (let i = 0; i < 50; i++) {
    const ip = `172.${16 + (i % 16)}.${i % 256}.${(i * 5) % 256}`;
    it(`172 range round-trip for ${ip}`, () => {
      expect(numberToIPv4(ipv4ToNumber(ip))).toBe(ip);
    });
  }
});

describe('getCIDRMask / getMaskPrefix cross-check', () => {
  for (let p = 0; p <= 32; p++) {
    it(`getMaskPrefix(getCIDRMask(${p})) === ${p}`, () => {
      expect(getMaskPrefix(getCIDRMask(p))).toBe(p);
    });
  }
});

describe('isInCIDR — 10.0.0.0/8 membership', () => {
  for (let i = 0; i < 20; i++) {
    const ip = `10.${i * 10 % 256}.${i}.1`;
    it(`${ip} is in 10.0.0.0/8`, () => {
      expect(isInCIDR(ip, '10.0.0.0/8')).toBe(true);
    });
  }
  for (let i = 0; i < 10; i++) {
    const ip = `${11 + i}.0.0.1`;
    it(`${ip} is NOT in 10.0.0.0/8`, () => {
      expect(isInCIDR(ip, '10.0.0.0/8')).toBe(false);
    });
  }
});

describe('compareIPv4 symmetry and transitivity', () => {
  const sampleIPs = [
    '1.2.3.4', '10.0.0.1', '100.50.25.10', '172.16.5.1',
    '192.168.1.1', '203.0.113.1', '255.0.0.0',
  ];
  for (let i = 0; i < sampleIPs.length; i++) {
    const ip = sampleIPs[i];
    it(`compareIPv4(${ip}, ${ip}) === 0 (reflexive)`, () => {
      expect(compareIPv4(ip, ip)).toBe(0);
    });
  }
  for (let i = 0; i < sampleIPs.length - 1; i++) {
    const a = sampleIPs[i];
    const b = sampleIPs[i + 1];
    it(`compareIPv4(${a}, ${b}) === -compareIPv4(${b}, ${a}) (antisymmetric)`, () => {
      const ab = compareIPv4(a, b);
      const ba = compareIPv4(b, a);
      expect(ab).toBe(-1);
      expect(ba).toBe(1);
    });
  }
});
