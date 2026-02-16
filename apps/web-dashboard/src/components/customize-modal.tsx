'use client';

import { useState } from 'react';
import { Modal } from '@ims/ui';
import { useRBACContext } from '@ims/rbac/react';
import { PermissionLevel } from '@ims/rbac';
import { useDashboardStore } from '@/lib/dashboard-store';
import {
  WIDGET_IDS,
  WIDGET_META,
  SECTION_IDS,
  SECTION_META,
  MODULE_RBAC_MAP,
  type WidgetId,
  type SectionId,
} from '@/lib/dashboard-config';
import { Lock, ChevronDown, ChevronUp, ArrowUp, ArrowDown } from 'lucide-react';

const SECTION_MODULES: Record<SectionId, string[]> = {
  'iso-compliance': [
    'Health & Safety', 'Environmental', 'Quality', 'ESG', 'Food Safety',
    'Energy', 'ISO 42001 (AI)', 'ISO 37001', 'InfoSec', 'Aerospace',
  ],
  'operations': [
    'Inventory', 'HR Management', 'Payroll', 'Workflows', 'Project Management',
    'Finance', 'CRM', 'CMMS', 'Field Service', 'Analytics',
  ],
  'portals-specialist': [
    'Customer Portal', 'Supplier Portal', 'Medical Devices', 'Automotive',
  ],
};

function Toggle({ checked, onChange, disabled }: { checked: boolean; onChange: () => void; disabled?: boolean }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={onChange}
      className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
        disabled
          ? 'cursor-not-allowed bg-gray-200 dark:bg-gray-700'
          : checked
          ? 'bg-blue-600'
          : 'bg-gray-300 dark:bg-gray-600'
      }`}
    >
      <span
        className={`inline-block h-4 w-4 rounded-full bg-white shadow transition-transform duration-200 ${
          checked ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
    </button>
  );
}

export function CustomizeModal() {
  const { customizeOpen, closeCustomize, config, toggleWidget, toggleSection, toggleModule, moveSection, resetToDefaults } =
    useDashboardStore();
  const { hasPermission, permissions } = useRBACContext();
  const [expandedSections, setExpandedSections] = useState<Record<SectionId, boolean>>({
    'iso-compliance': true,
    'operations': false,
    'portals-specialist': false,
  });

  const toggleExpand = (id: SectionId) =>
    setExpandedSections((prev) => ({ ...prev, [id]: !prev[id] }));

  const canAccessModule = (moduleName: string): boolean => {
    const rbacModule = MODULE_RBAC_MAP[moduleName];
    if (!rbacModule) return true;
    // If no permissions resolved (no token/roles), allow all
    if (!permissions) return true;
    return hasPermission(rbacModule, PermissionLevel.VIEW);
  };

  const sortedSections = [...SECTION_IDS].sort(
    (a, b) => config.sections[a].order - config.sections[b].order
  );

  return (
    <Modal isOpen={customizeOpen} onClose={closeCustomize} title="Customize Dashboard" size="lg">
      <div className="space-y-6 max-h-[70vh] overflow-y-auto pr-1">
        {/* Widgets Section */}
        <div>
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide mb-3">
            Widgets
          </h3>
          <div className="space-y-2">
            {WIDGET_IDS.map((id) => {
              const meta = WIDGET_META[id];
              return (
                <div
                  key={id}
                  className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{meta.label}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{meta.description}</p>
                  </div>
                  <Toggle
                    checked={config.widgets[id].visible}
                    onChange={() => toggleWidget(id)}
                  />
                </div>
              );
            })}
          </div>
        </div>

        {/* Module Sections */}
        <div>
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide mb-3">
            Module Sections
          </h3>
          <div className="space-y-3">
            {sortedSections.map((sectionId, idx) => {
              const sectionMeta = SECTION_META[sectionId];
              const modules = SECTION_MODULES[sectionId];
              const isExpanded = expandedSections[sectionId];

              return (
                <div key={sectionId} className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                  {/* Section Header */}
                  <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800">
                    <button
                      onClick={() => toggleExpand(sectionId)}
                      className="flex items-center gap-2 flex-1 min-w-0 text-left"
                    >
                      {isExpanded ? (
                        <ChevronUp className="h-4 w-4 text-gray-400 shrink-0" />
                      ) : (
                        <ChevronDown className="h-4 w-4 text-gray-400 shrink-0" />
                      )}
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{sectionMeta.label}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{sectionMeta.description}</p>
                      </div>
                    </button>
                    <div className="flex items-center gap-2 shrink-0">
                      <div className="flex flex-col">
                        <button
                          onClick={() => moveSection(sectionId, 'up')}
                          disabled={idx === 0}
                          className="p-0.5 text-gray-400 hover:text-gray-600 disabled:opacity-30"
                          aria-label="Move section up"
                        >
                          <ArrowUp className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => moveSection(sectionId, 'down')}
                          disabled={idx === sortedSections.length - 1}
                          className="p-0.5 text-gray-400 hover:text-gray-600 disabled:opacity-30"
                          aria-label="Move section down"
                        >
                          <ArrowDown className="h-3.5 w-3.5" />
                        </button>
                      </div>
                      <Toggle
                        checked={config.sections[sectionId].visible}
                        onChange={() => toggleSection(sectionId)}
                      />
                    </div>
                  </div>

                  {/* Module List */}
                  {isExpanded && (
                    <div className="divide-y divide-gray-100 dark:divide-gray-700">
                      {modules.map((moduleName) => {
                        const hasAccess = canAccessModule(moduleName);
                        const isHidden = config.hiddenModules.includes(moduleName);

                        return (
                          <div
                            key={moduleName}
                            className="flex items-center justify-between px-4 py-2.5 pl-10"
                          >
                            <div className="flex items-center gap-2">
                              <span className={`text-sm ${hasAccess ? 'text-gray-700 dark:text-gray-300' : 'text-gray-400 dark:text-gray-500'}`}>
                                {moduleName}
                              </span>
                              {!hasAccess && (
                                <Lock className="h-3.5 w-3.5 text-gray-400 dark:text-gray-500" />
                              )}
                            </div>
                            <Toggle
                              checked={!isHidden && hasAccess}
                              onChange={() => toggleModule(moduleName)}
                              disabled={!hasAccess}
                            />
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-6 flex justify-between">
        <button
          onClick={resetToDefaults}
          className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
        >
          Reset to Defaults
        </button>
        <button
          onClick={closeCustomize}
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
        >
          Done
        </button>
      </div>
    </Modal>
  );
}
