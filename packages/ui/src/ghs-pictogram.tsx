'use client';
import React from 'react';

export type GhsPictogramType =
  | 'GHS01_EXPLOSIVE'
  | 'GHS02_FLAMMABLE'
  | 'GHS03_OXIDISING'
  | 'GHS04_GAS_UNDER_PRESSURE'
  | 'GHS05_CORROSIVE'
  | 'GHS06_TOXIC'
  | 'GHS07_IRRITANT_HARMFUL'
  | 'GHS08_HEALTH_HAZARD'
  | 'GHS09_ENVIRONMENTAL';

const PICTOGRAM_LABELS: Record<GhsPictogramType, string> = {
  GHS01_EXPLOSIVE: 'Explosive',
  GHS02_FLAMMABLE: 'Flammable',
  GHS03_OXIDISING: 'Oxidising',
  GHS04_GAS_UNDER_PRESSURE: 'Gas Under Pressure',
  GHS05_CORROSIVE: 'Corrosive',
  GHS06_TOXIC: 'Toxic',
  GHS07_IRRITANT_HARMFUL: 'Irritant / Harmful',
  GHS08_HEALTH_HAZARD: 'Health Hazard',
  GHS09_ENVIRONMENTAL: 'Environmental Hazard',
};

const SIZES = { sm: 32, md: 48, lg: 64 } as const;

function DiamondFrame({ size, children }: { size: number; children: React.ReactNode }) {
  const half = size / 2;
  const inset = 2;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} xmlns="http://www.w3.org/2000/svg">
      <polygon
        points={`${half},${inset} ${size - inset},${half} ${half},${size - inset} ${inset},${half}`}
        fill="white"
        stroke="#CC0000"
        strokeWidth="2"
      />
      <g transform={`translate(${size * 0.2}, ${size * 0.2}) scale(${size * 0.006})`}>
        {children}
      </g>
    </svg>
  );
}

function ExplosiveSymbol() {
  return (
    <g fill="black">
      <circle cx="50" cy="50" r="8" />
      <line x1="50" y1="15" x2="50" y2="35" stroke="black" strokeWidth="4" />
      <line x1="50" y1="65" x2="50" y2="85" stroke="black" strokeWidth="4" />
      <line x1="15" y1="50" x2="35" y2="50" stroke="black" strokeWidth="4" />
      <line x1="65" y1="50" x2="85" y2="50" stroke="black" strokeWidth="4" />
      <line x1="25" y1="25" x2="38" y2="38" stroke="black" strokeWidth="3" />
      <line x1="62" y1="62" x2="75" y2="75" stroke="black" strokeWidth="3" />
      <line x1="75" y1="25" x2="62" y2="38" stroke="black" strokeWidth="3" />
      <line x1="38" y1="62" x2="25" y2="75" stroke="black" strokeWidth="3" />
    </g>
  );
}

function FlameSymbol() {
  return (
    <path
      d="M50 10 C50 10, 75 35, 70 55 C68 62, 60 70, 55 72 C58 65, 55 55, 50 50 C45 55, 42 65, 45 72 C40 70, 32 62, 30 55 C25 35, 50 10, 50 10Z"
      fill="black"
    />
  );
}

function OxidisingSymbol() {
  return (
    <g fill="black">
      <circle cx="50" cy="65" r="18" fill="none" stroke="black" strokeWidth="4" />
      <path d="M50 10 C50 10, 70 30, 65 45 C62 52, 55 55, 50 50 C45 55, 38 52, 35 45 C30 30, 50 10, 50 10Z" />
    </g>
  );
}

function GasCylinderSymbol() {
  return (
    <g fill="black">
      <rect x="30" y="25" width="40" height="55" rx="10" />
      <rect x="40" y="15" width="20" height="15" rx="3" />
    </g>
  );
}

function CorrosiveSymbol() {
  return (
    <g fill="black">
      <path d="M25 25 L35 25 L30 50 L40 50 L40 75 L20 75 L20 50 L25 50 Z" />
      <path d="M55 25 L65 25 L60 50 L70 50 L70 75 L50 75 L50 50 L55 50 Z" />
      <rect x="20" y="75" width="55" height="8" rx="2" />
    </g>
  );
}

function SkullSymbol() {
  return (
    <g fill="black">
      <circle cx="50" cy="35" r="22" />
      <circle cx="40" cy="30" r="6" fill="white" />
      <circle cx="60" cy="30" r="6" fill="white" />
      <path d="M42 45 L58 45 L55 42 L52 45 L50 42 L48 45 L45 42 Z" fill="white" />
      <rect x="47" y="55" width="6" height="25" />
      <rect x="37" y="65" width="26" height="6" />
    </g>
  );
}

function ExclamationSymbol() {
  return (
    <g fill="black">
      <rect x="44" y="15" width="12" height="45" rx="3" />
      <circle cx="50" cy="75" r="7" />
    </g>
  );
}

function HealthHazardSymbol() {
  return (
    <g fill="black">
      <circle cx="50" cy="25" r="10" />
      <rect x="42" y="35" width="16" height="25" rx="2" />
      <polygon points="30,50 42,42 42,55" />
      <polygon points="70,50 58,42 58,55" />
      <line x1="42" y1="60" x2="35" y2="80" stroke="black" strokeWidth="6" strokeLinecap="round" />
      <line x1="58" y1="60" x2="65" y2="80" stroke="black" strokeWidth="6" strokeLinecap="round" />
      <path d="M35 42 L25 38 L28 48 Z" fill="white" />
    </g>
  );
}

function EnvironmentalSymbol() {
  return (
    <g fill="black">
      <path d="M20 80 C20 80, 25 60, 35 55 C35 55, 30 50, 30 40 C30 30, 40 20, 45 15 C45 15, 40 30, 45 35 C45 35, 50 25, 55 30 C60 35, 55 45, 50 50 L55 55 C55 55, 60 50, 65 55 C70 60, 65 70, 55 75 L80 80 Z" />
      <ellipse cx="55" cy="82" rx="20" ry="5" fill="black" />
    </g>
  );
}

const SYMBOL_MAP: Record<GhsPictogramType, React.FC> = {
  GHS01_EXPLOSIVE: ExplosiveSymbol,
  GHS02_FLAMMABLE: FlameSymbol,
  GHS03_OXIDISING: OxidisingSymbol,
  GHS04_GAS_UNDER_PRESSURE: GasCylinderSymbol,
  GHS05_CORROSIVE: CorrosiveSymbol,
  GHS06_TOXIC: SkullSymbol,
  GHS07_IRRITANT_HARMFUL: ExclamationSymbol,
  GHS08_HEALTH_HAZARD: HealthHazardSymbol,
  GHS09_ENVIRONMENTAL: EnvironmentalSymbol,
};

export interface GhsPictogramProps {
  pictogram: GhsPictogramType;
  size?: 'sm' | 'md' | 'lg';
}

export function GhsPictogram({ pictogram, size = 'md' }: GhsPictogramProps) {
  const px = SIZES[size];
  const Symbol = SYMBOL_MAP[pictogram];
  const label = PICTOGRAM_LABELS[pictogram];

  if (!Symbol) return null;

  return (
    <span title={label} aria-label={label} role="img" className="inline-block">
      <DiamondFrame size={px}>
        <Symbol />
      </DiamondFrame>
    </span>
  );
}

export interface GhsPictogramGroupProps {
  pictograms: GhsPictogramType[];
  size?: 'sm' | 'md' | 'lg';
}

export function GhsPictogramGroup({ pictograms, size = 'sm' }: GhsPictogramGroupProps) {
  if (!pictograms || pictograms.length === 0) return null;
  return (
    <span className="inline-flex items-center gap-1 flex-wrap">
      {pictograms.map((p) => (
        <GhsPictogram key={p} pictogram={p} size={size} />
      ))}
    </span>
  );
}
