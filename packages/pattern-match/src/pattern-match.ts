// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.

export type RangePattern = { min: number; max: number };
export type PredicatePattern<T> = (v: T) => boolean;
export type ArrayPattern = unknown[];
export type ObjectShapePattern = Record<string, unknown>;
export type Pattern<T> = T | PredicatePattern<T> | RangePattern | RegExp | ArrayPattern | ObjectShapePattern;

export function isString(v: unknown): v is string { return typeof v === "string"; }
export function isNumber(v: unknown): v is number { return typeof v === "number"; }
export function isBoolean(v: unknown): v is boolean { return typeof v === "boolean"; }
export function isNull(v: unknown): v is null { return v === null; }
export function isUndefined(v: unknown): v is undefined { return v === undefined; }
export function isArray(v: unknown): v is unknown[] { return Array.isArray(v); }
export function isObject(v: unknown): v is Record<string, unknown> { return v !== null && typeof v === "object" && !Array.isArray(v); }

export type TypeName = "string" | "number" | "boolean" | "null" | "undefined" | "array" | "object" | "function";
export function matchType(value: unknown): TypeName {
  if (value === null) return "null";
  if (value === undefined) return "undefined";
  if (Array.isArray(value)) return "array";
  const t = typeof value;
  if (t === "string" || t === "number" || t === "boolean" || t === "function") return t as TypeName;
  return "object";
}

export function when(pred){ return pred; }

function isRangePattern(p) { return p !== null && typeof p === "object" && !Array.isArray(p) && !(p instanceof RegExp) && "min" in p && "max" in p; }

function patternMatches(pattern, value) {
  if (typeof pattern === "function") return pattern(value);
  if (pattern instanceof RegExp) return pattern.test(String(value));
  if (isRangePattern(pattern)) { var n = value; return typeof n === "number" && n >= pattern.min && n <= pattern.max; }
  if (Array.isArray(pattern)) { if (!Array.isArray(value)) return false; return pattern.every(function(p,i){ return patternMatches(p, value[i]); }); }
  if (typeof pattern === "object" && pattern !== null) { if (typeof value !== "object" || value === null || Array.isArray(value)) return false; return Object.keys(pattern).every(function(k){ return patternMatches(pattern[k], value[k]); }); }
  return Object.is(value, pattern);
}

class MatchBuilderImpl {
  constructor(value) { this._value = value; this._cases = []; }
  with(pattern, handler) { this._cases.push({pattern:pattern,handler:handler}); return this; }
  otherwise(handler) { var v=this._value; var c=this._cases; return {run:function(){ for(var i=0;i<c.length;i++){if(patternMatches(c[i].pattern,v))return c[i].handler(v);}return handler(v);}}; }
  run() { for(var i=0;i<this._cases.length;i++){if(patternMatches(this._cases[i].pattern,this._value))return this._cases[i].handler(this._value);}return undefined; }
}

export function match(value) { return new MatchBuilderImpl(value); }

function globToRegex(pattern) { var r=''; for(var i=0;i<pattern.length;i++){var ch=pattern[i];if(ch==='*')r+='.*';else if(ch==='?')r+='.';else r+=ch;}return new RegExp('^'+ r +'$'); }
export function glob(pattern, str) { return globToRegex(pattern).test(str); }
export function wildcardMatch(pattern, str) { return glob(pattern, str); }

export function deepMatch(obj, pattern) { if(pattern===null)return obj===null; if(pattern===undefined)return obj===undefined; if(Array.isArray(pattern)){if(!Array.isArray(obj))return false;return pattern.every(function(p,i){return deepMatch(obj[i],p);});} if(typeof pattern==="object"){if(typeof obj!=="object"||obj===null||Array.isArray(obj))return false;return Object.keys(pattern).every(function(k){return deepMatch(obj[k],pattern[k]);});} return Object.is(obj,pattern); }

export function extractGroups(regex, str) { var m=regex.exec(str); if(!m)return null; return m.groups||{}; }

