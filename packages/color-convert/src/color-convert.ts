// Copyright (c) 2026 Nexara DMCC. All rights reserved.

export interface RGB { r: number; g: number; b: number; }
export interface HSL { h: number; s: number; l: number; }
export interface HSV { h: number; s: number; v: number; }
export interface CMYK { c: number; m: number; y: number; k: number; }

export function hexToRgb(hex: string): RGB {
  const clean = hex.replace('#','');
  const n = parseInt(clean.length === 3 ? clean.split('').map(c=>c+c).join('') : clean, 16);
  return { r: (n>>16)&255, g: (n>>8)&255, b: n&255 };
}
export function rgbToHex(c: RGB): string { return '#'+[c.r,c.g,c.b].map(v=>v.toString(16).padStart(2,'0')).join(''); }
export function rgbToHsl(c: RGB): HSL {
  const r=c.r/255, g=c.g/255, b=c.b/255;
  const max=Math.max(r,g,b), min=Math.min(r,g,b), d=max-min;
  let h=0, s=0; const l=(max+min)/2;
  if (d) {
    s = l > 0.5 ? d/(2-max-min) : d/(max+min);
    if (max===r) h=(g-b)/d + (g<b?6:0);
    else if (max===g) h=(b-r)/d+2;
    else h=(r-g)/d+4;
    h/=6;
  }
  return { h: Math.round(h*360), s: Math.round(s*100), l: Math.round(l*100) };
}
export function hslToRgb(c: HSL): RGB {
  const h=c.h/360, s=c.s/100, l=c.l/100;
  if (!s) { const v=Math.round(l*255); return {r:v,g:v,b:v}; }
  const q = l<0.5 ? l*(1+s) : l+s-l*s, p = 2*l-q;
  const hue2rgb = (p2: number, q2: number, t2: number) => {
    if(t2<0)t2++;if(t2>1)t2--;
    if(t2<1/6)return p2+(q2-p2)*6*t2;
    if(t2<1/2)return q2;
    if(t2<2/3)return p2+(q2-p2)*(2/3-t2)*6;
    return p2;
  };
  return { r: Math.round(hue2rgb(p,q,h+1/3)*255), g: Math.round(hue2rgb(p,q,h)*255), b: Math.round(hue2rgb(p,q,h-1/3)*255) };
}
export function rgbToHsv(c: RGB): HSV {
  const r=c.r/255, g=c.g/255, b=c.b/255;
  const max=Math.max(r,g,b), min=Math.min(r,g,b), d=max-min;
  let h=0; const s=max===0?0:d/max, v=max;
  if (d) {
    if(max===r) h=(g-b)/d+(g<b?6:0);
    else if(max===g) h=(b-r)/d+2;
    else h=(r-g)/d+4;
    h/=6;
  }
  return { h: Math.round(h*360), s: Math.round(s*100), v: Math.round(v*100) };
}
export function rgbToCmyk(c: RGB): CMYK {
  if (c.r===0&&c.g===0&&c.b===0) return {c:0,m:0,y:0,k:100};
  const r=c.r/255, g=c.g/255, b=c.b/255;
  const k=1-Math.max(r,g,b);
  return { c: Math.round((1-r-k)/(1-k)*100), m: Math.round((1-g-k)/(1-k)*100), y: Math.round((1-b-k)/(1-k)*100), k: Math.round(k*100) };
}
export function lighten(hex: string, amount: number): string {
  const hsl = rgbToHsl(hexToRgb(hex));
  return rgbToHex(hslToRgb({ ...hsl, l: Math.min(100, hsl.l+amount) }));
}
export function darken(hex: string, amount: number): string {
  const hsl = rgbToHsl(hexToRgb(hex));
  return rgbToHex(hslToRgb({ ...hsl, l: Math.max(0, hsl.l-amount) }));
}
export function mix(hex1: string, hex2: string, weight = 0.5): string {
  const a=hexToRgb(hex1), b=hexToRgb(hex2);
  return rgbToHex({ r: Math.round(a.r*(1-weight)+b.r*weight), g: Math.round(a.g*(1-weight)+b.g*weight), b: Math.round(a.b*(1-weight)+b.b*weight) });
}
export function luminance(hex: string): number {
  const {r,g,b}=hexToRgb(hex);
  const [rr,gg,bb]=[r,g,b].map(v=>{ const s=v/255; return s<=0.03928?s/12.92:((s+0.055)/1.055)**2.4; });
  return 0.2126*rr+0.7152*gg+0.0722*bb;
}
export function contrast(hex1: string, hex2: string): number {
  const l1=luminance(hex1)+0.05, l2=luminance(hex2)+0.05;
  return Math.max(l1,l2)/Math.min(l1,l2);
}
export function isLight(hex: string): boolean { return luminance(hex) > 0.179; }
