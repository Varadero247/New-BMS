'use client';

import React, { type ReactNode } from 'react';
import { usePermission, useCanAccess } from './hooks';
import type { ImsModule } from '../types';
import { PermissionLevel } from '../types';

interface GuardProps {
  module: ImsModule;
  children: ReactNode;
  fallback?: ReactNode;
}

interface LevelGuardProps extends GuardProps {
  level: PermissionLevel;
}

export function NavigationGuard({ module, children, fallback = null }: GuardProps) {
  const canAccess = useCanAccess(module);
  if (!canAccess) return React.createElement(React.Fragment, null, fallback);
  return React.createElement(React.Fragment, null, children);
}

export function PageGuard({
  module,
  level = PermissionLevel.VIEW,
  children,
  fallback,
}: LevelGuardProps) {
  const allowed = usePermission(module, level);
  if (!allowed) {
    return React.createElement(
      React.Fragment,
      null,
      fallback ||
        React.createElement(
          'div',
          { className: 'p-8 text-center' },
          React.createElement(
            'h2',
            { className: 'text-xl font-semibold text-gray-700' },
            'Access Denied'
          ),
          React.createElement(
            'p',
            { className: 'text-gray-500 mt-2' },
            'You do not have permission to view this page.'
          )
        )
    );
  }
  return React.createElement(React.Fragment, null, children);
}

export function ActionGuard({ module, level, children, fallback = null }: LevelGuardProps) {
  const allowed = usePermission(module, level);
  if (!allowed) return React.createElement(React.Fragment, null, fallback);
  return React.createElement(React.Fragment, null, children);
}

export function FieldGuard({ module, level, children, fallback = null }: LevelGuardProps) {
  const allowed = usePermission(module, level);
  if (!allowed) return React.createElement(React.Fragment, null, fallback);
  return React.createElement(React.Fragment, null, children);
}
