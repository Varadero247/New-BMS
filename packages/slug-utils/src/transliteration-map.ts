// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.

export const TRANSLITERATION_MAP: Record<string, string> = {
  // Lowercase Latin extended
  '\u00e0': 'a', '\u00e1': 'a', '\u00e2': 'a', '\u00e3': 'a', '\u00e4': 'ae', '\u00e5': 'a',
  '\u00e6': 'ae', '\u00e7': 'c', '\u00e8': 'e', '\u00e9': 'e', '\u00ea': 'e', '\u00eb': 'e',
  '\u00ec': 'i', '\u00ed': 'i', '\u00ee': 'i', '\u00ef': 'i', '\u00f0': 'd', '\u00f1': 'n',
  '\u00f2': 'o', '\u00f3': 'o', '\u00f4': 'o', '\u00f5': 'o', '\u00f6': 'oe', '\u00f8': 'o',
  '\u00f9': 'u', '\u00fa': 'u', '\u00fb': 'u', '\u00fc': 'ue', '\u00fd': 'y', '\u00fe': 'th',
  '\u00df': 'ss',
  // Uppercase Latin extended
  '\u00c0': 'A', '\u00c1': 'A', '\u00c2': 'A', '\u00c3': 'A', '\u00c4': 'Ae', '\u00c5': 'A',
  '\u00c6': 'Ae', '\u00c7': 'C', '\u00c8': 'E', '\u00c9': 'E', '\u00ca': 'E', '\u00cb': 'E',
  '\u00cc': 'I', '\u00cd': 'I', '\u00ce': 'I', '\u00cf': 'I', '\u00d0': 'D', '\u00d1': 'N',
  '\u00d2': 'O', '\u00d3': 'O', '\u00d4': 'O', '\u00d5': 'O', '\u00d6': 'Oe', '\u00d8': 'O',
  '\u00d9': 'U', '\u00da': 'U', '\u00db': 'U', '\u00dc': 'Ue', '\u00dd': 'Y', '\u00de': 'Th',
  // Polish
  '\u0105': 'a', '\u0107': 'c', '\u0119': 'e', '\u0142': 'l', '\u0144': 'n',
  '\u015b': 's', '\u017a': 'z', '\u017c': 'z',
  '\u0104': 'A', '\u0106': 'C', '\u0118': 'E', '\u0141': 'L', '\u0143': 'N',
  '\u015a': 'S', '\u0179': 'Z', '\u017b': 'Z',
  // Czech/Slovak
  '\u010d': 'c', '\u010f': 'd', '\u011b': 'e', '\u0148': 'n', '\u0159': 'r',
  '\u0161': 's', '\u0165': 't', '\u017e': 'z', '\u016f': 'u',
  '\u010c': 'C', '\u010e': 'D', '\u011a': 'E', '\u0147': 'N', '\u0158': 'R',
  '\u0160': 'S', '\u0164': 'T', '\u017d': 'Z', '\u016e': 'U',
  // Turkish
  '\u011f': 'g', '\u0131': 'i', '\u015f': 's',
  '\u011e': 'G', '\u0130': 'I', '\u015e': 'S',
  // Romanian
  '\u0103': 'a', '\u0219': 's', '\u021b': 't',
  '\u0102': 'A', '\u0218': 'S', '\u021a': 'T',
  // Special chars → words
  '&': ' and ', '@': ' at ', '%': ' percent ', '#': ' number ',
  '+': ' plus ', '=': ' equals ',
  '$': ' dollar ', '\u20ac': ' euro ', '\u00a3': ' pound ', '\u00a5': ' yen ',
  // Smart quotes / dashes
  '\u2018': '', '\u2019': '', '\u201c': '', '\u201d': '', '\u201e': '',
  '\u2013': '-', '\u2014': '-', '\u2010': '-',
  '\u2026': '...',
};
