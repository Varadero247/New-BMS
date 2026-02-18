'use client';

import * as React from 'react';
import { cn } from './utils';

export interface SidebarItem {
  id: string;
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
  href: string;
  group?: string;
}

export interface AppSidebarProps {
  items: SidebarItem[];
  activeId: string;
  moduleColor: string;
  className?: string;
}

export function AppSidebar({ items, activeId, moduleColor, className }: AppSidebarProps) {
  const groups = React.useMemo(() => {
    const map = new Map<string, SidebarItem[]>();
    for (const item of items) {
      const group = item.group || '';
      if (!map.has(group)) map.set(group, []);
      map.get(group)!.push(item);
    }
    return map;
  }, [items]);

  return (
    <aside
      className={cn('flex flex-col h-full overflow-y-auto', className)}
      style={{
        width: 196,
        background: 'var(--midnight, #101828)',
        borderRight: '1px solid var(--border, #1E2E48)',
      }}
    >
      <nav className="flex-1 p-3 space-y-4" aria-label="Module navigation">
        {Array.from(groups.entries()).map(([group, groupItems]) => (
          <div key={group}>
            {group && (
              <div
                className="px-2 mb-2"
                style={{
                  fontFamily: "'DM Mono', monospace",
                  fontSize: '0.58rem',
                  letterSpacing: '0.14em',
                  textTransform: 'uppercase' as const,
                  color: 'var(--muted, #344D72)',
                }}
              >
                {group}
              </div>
            )}
            <ul className="space-y-0.5">
              {groupItems.map((item) => {
                const isActive = item.id === activeId;
                const Icon = item.icon;
                return (
                  <li key={item.id}>
                    <a
                      href={item.href}
                      aria-current={isActive ? 'page' : undefined}
                      className={cn(
                        'flex items-center gap-[9px] px-2 py-1.5 rounded-md text-[0.76rem] transition-colors',
                        isActive ? 'font-medium' : 'hover:bg-[rgba(59,120,245,0.08)]'
                      )}
                      style={{
                        background: isActive ? 'rgba(59,120,245,0.12)' : undefined,
                        color: isActive ? 'var(--blue-hi, #5B94FF)' : 'var(--steel, #5A7099)',
                        borderRadius: 6,
                      }}
                    >
                      {/* Module dot */}
                      <span
                        className="shrink-0 rounded-full"
                        style={{
                          width: 6,
                          height: 6,
                          backgroundColor: moduleColor,
                        }}
                      />
                      {Icon && <Icon className="h-4 w-4 shrink-0" />}
                      <span className="truncate">{item.label}</span>
                    </a>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>
    </aside>
  );
}
