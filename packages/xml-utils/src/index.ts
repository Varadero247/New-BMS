// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.

export type {
  XmlNode,
  XmlDocument,
  XmlBuildOptions,
  XmlParseOptions,
  XPathResult,
} from './types';

export {
  // Utilities
  escapeXml,
  unescapeXml,
  isValidXmlName,
  // Parsing
  parseXml,
  parseXmlNode,
  // Building
  buildXml,
  buildXmlNode,
  nodeToString,
  // Querying
  findByTag,
  findFirst,
  findByAttribute,
  getTextContent,
  getChildrenByTag,
  getAttribute,
  hasAttribute,
  countNodes,
  getDepth,
  // Transformation
  mapNodes,
  filterNodes,
  addChild,
  removeChild,
  setAttribute,
  removeAttribute,
  createNode,
  createDocument,
  // Conversion
  xmlToJson,
  jsonToXml,
} from './xml-utils';
