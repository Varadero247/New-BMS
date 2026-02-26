// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.

export interface XmlNode {
  tag: string;
  attributes: Record<string, string>;
  children: XmlNode[];
  text?: string;         // text content (trimmed)
  selfClosing?: boolean;
}

export interface XmlDocument {
  declaration?: Record<string, string>; // version, encoding etc
  root: XmlNode;
}

export interface XmlBuildOptions {
  indent?: string;      // default '  '
  declaration?: boolean; // include <?xml ...?> header
}

export interface XmlParseOptions {
  preserveWhitespace?: boolean;
}

export interface XPathResult {
  nodes: XmlNode[];
  count: number;
}
