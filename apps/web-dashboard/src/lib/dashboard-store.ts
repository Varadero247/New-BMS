import { create } from 'zustand';
import type { DashboardConfig, WidgetId, SectionId } from './dashboard-config';
import { DEFAULT_CONFIG, SECTION_IDS } from './dashboard-config';

const STORAGE_KEY = 'ims-dashboard-config';

function readConfig(): DashboardConfig {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      let parsed = JSON.parse(raw);
      // Handle old Zustand persist format { state: { config: ... } }
      if (parsed.state?.config) parsed = parsed.state.config;
      if (parsed.config) parsed = parsed.config;
      // Only merge if parsed has the right shape
      if (parsed.widgets && parsed.sections) {
        return {
          widgets: { ...DEFAULT_CONFIG.widgets, ...parsed.widgets },
          sections: { ...DEFAULT_CONFIG.sections, ...parsed.sections },
          hiddenModules: Array.isArray(parsed.hiddenModules) ? parsed.hiddenModules : [],
        };
      }
    }
  } catch {
    // corrupted or unavailable — clear bad data
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {}
  }
  return DEFAULT_CONFIG;
}

function saveConfig(config: DashboardConfig) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
  } catch {
    // storage full or unavailable
  }
}

interface DashboardStore {
  config: DashboardConfig;
  hydrated: boolean;
  customizeOpen: boolean;
  hydrate: () => void;
  toggleWidget: (id: WidgetId) => void;
  toggleSection: (id: SectionId) => void;
  toggleModule: (moduleName: string) => void;
  moveSection: (id: SectionId, direction: 'up' | 'down') => void;
  resetToDefaults: () => void;
  openCustomize: () => void;
  closeCustomize: () => void;
}

export const useDashboardStore = create<DashboardStore>()((set) => ({
  config: DEFAULT_CONFIG,
  hydrated: false,
  customizeOpen: false,

  hydrate: () => set({ config: readConfig(), hydrated: true }),

  toggleWidget: (id) =>
    set((state) => {
      const newConfig = {
        ...state.config,
        widgets: {
          ...state.config.widgets,
          [id]: {
            ...state.config.widgets[id],
            visible: !state.config.widgets[id].visible,
          },
        },
      };
      saveConfig(newConfig);
      return { config: newConfig };
    }),

  toggleSection: (id) =>
    set((state) => {
      const newConfig = {
        ...state.config,
        sections: {
          ...state.config.sections,
          [id]: {
            ...state.config.sections[id],
            visible: !state.config.sections[id].visible,
          },
        },
      };
      saveConfig(newConfig);
      return { config: newConfig };
    }),

  toggleModule: (moduleName) =>
    set((state) => {
      const hidden = state.config.hiddenModules;
      const isHidden = hidden.includes(moduleName);
      const newConfig = {
        ...state.config,
        hiddenModules: isHidden ? hidden.filter((m) => m !== moduleName) : [...hidden, moduleName],
      };
      saveConfig(newConfig);
      return { config: newConfig };
    }),

  moveSection: (id, direction) =>
    set((state) => {
      const sorted = [...SECTION_IDS].sort(
        (a, b) => state.config.sections[a].order - state.config.sections[b].order
      );
      const idx = sorted.indexOf(id);
      const swapIdx = direction === 'up' ? idx - 1 : idx + 1;
      if (swapIdx < 0 || swapIdx >= sorted.length) return state;

      const other = sorted[swapIdx];
      const currentOrder = state.config.sections[id].order;
      const otherOrder = state.config.sections[other].order;

      const newConfig = {
        ...state.config,
        sections: {
          ...state.config.sections,
          [id]: { ...state.config.sections[id], order: otherOrder },
          [other]: { ...state.config.sections[other], order: currentOrder },
        },
      };
      saveConfig(newConfig);
      return { config: newConfig };
    }),

  resetToDefaults: () => {
    saveConfig(DEFAULT_CONFIG);
    return set({ config: DEFAULT_CONFIG });
  },

  openCustomize: () => set({ customizeOpen: true }),
  closeCustomize: () => set({ customizeOpen: false }),
}));
