// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.

import { manifestSchema, type PackManifest, type InstantStartPack } from './types';
import automotiveManifestRaw from './packs/automotive-iatf/manifest.json';
import { sections as automotiveSections } from './packs/automotive-iatf/seed';
import constructionManifestRaw from './packs/construction-iso45001/manifest.json';
import { sections as constructionSections } from './packs/construction-iso45001/seed';
import medtechManifestRaw from './packs/medtech-iso13485/manifest.json';
import { sections as medtechSections } from './packs/medtech-iso13485/seed';
import foodSafetyManifestRaw from './packs/food-safety-brc/manifest.json';
import { sections as foodSafetySections } from './packs/food-safety-brc/seed';
import professionalServicesManifestRaw from './packs/professional-services-iso27001/manifest.json';
import { sections as professionalServicesSections } from './packs/professional-services-iso27001/seed';

function parsePack(raw: unknown, sections: InstantStartPack['sections']): InstantStartPack {
  const manifest = manifestSchema.parse(raw);
  return { manifest, sections };
}

const PACKS: InstantStartPack[] = [
  parsePack(automotiveManifestRaw, automotiveSections),
  parsePack(constructionManifestRaw, constructionSections),
  parsePack(medtechManifestRaw, medtechSections),
  parsePack(foodSafetyManifestRaw, foodSafetySections),
  parsePack(professionalServicesManifestRaw, professionalServicesSections),
];

const REGISTRY = new Map<string, InstantStartPack>(
  PACKS.map(p => [p.manifest.id, p]),
);

export function listPacks(): PackManifest[] {
  return PACKS.map(p => p.manifest);
}

export function listPacksByStandard(standard: string): PackManifest[] {
  return PACKS
    .filter(p => p.manifest.standards.some(s => s.toLowerCase().includes(standard.toLowerCase())))
    .map(p => p.manifest);
}

export function getPack(id: string): InstantStartPack | undefined {
  return REGISTRY.get(id);
}

export function getManifest(id: string): PackManifest | undefined {
  return REGISTRY.get(id)?.manifest;
}

export function packExists(id: string): boolean {
  return REGISTRY.has(id);
}

export function searchPacks(query: string): PackManifest[] {
  const q = query.toLowerCase();
  return PACKS
    .filter(p => {
      const m = p.manifest;
      return (
        m.id.includes(q) ||
        m.name.toLowerCase().includes(q) ||
        m.description.toLowerCase().includes(q) ||
        m.targetCustomer.toLowerCase().includes(q) ||
        m.standards.some(s => s.toLowerCase().includes(q))
      );
    })
    .map(p => p.manifest);
}
