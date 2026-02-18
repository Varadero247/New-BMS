'use client';

import { useState, useEffect, useCallback } from 'react';

interface WizardState {
  dismissed: boolean;
  completed: boolean;
  minimized: boolean;
  lastSeenStep: number;
  checklistDismissed: boolean;
  checklistItems: Record<string, boolean>;
}

const STORAGE_KEY = 'nexara:welcome-wizard';

const DEFAULT_STATE: WizardState = {
  dismissed: false,
  completed: false,
  minimized: false,
  lastSeenStep: 0,
  checklistDismissed: false,
  checklistItems: {},
};

function loadState(): WizardState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_STATE;
    return { ...DEFAULT_STATE, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_STATE;
  }
}

function saveState(state: WizardState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // localStorage unavailable
  }
}

export function useWelcomeWizard() {
  const [state, setState] = useState<WizardState>(DEFAULT_STATE);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setState(loadState());
    setHydrated(true);
  }, []);

  const update = useCallback((patch: Partial<WizardState>) => {
    setState((prev) => {
      const next = { ...prev, ...patch };
      saveState(next);
      return next;
    });
  }, []);

  const setStep = useCallback(
    (step: number) => {
      update({ lastSeenStep: step });
    },
    [update]
  );

  const minimize = useCallback(() => {
    update({ minimized: true });
  }, [update]);

  const expand = useCallback(() => {
    update({ minimized: false });
  }, [update]);

  const dismiss = useCallback(() => {
    update({ dismissed: true, minimized: false });
  }, [update]);

  const complete = useCallback(() => {
    update({
      completed: true,
      minimized: false,
      checklistItems: { 'explore-dashboard': true },
    });
  }, [update]);

  const reopen = useCallback(() => {
    update({ dismissed: false, minimized: false, completed: false });
  }, [update]);

  const dismissChecklist = useCallback(() => {
    update({ checklistDismissed: true });
  }, [update]);

  const completeChecklistItem = useCallback((id: string) => {
    setState((prev) => {
      const next = {
        ...prev,
        checklistItems: { ...prev.checklistItems, [id]: true },
      };
      saveState(next);
      return next;
    });
  }, []);

  const isOpen = hydrated && !state.dismissed && !state.completed && !state.minimized;
  const showFab = hydrated && !state.dismissed && !state.completed && state.minimized;
  const showChecklist = hydrated && state.completed && !state.checklistDismissed;

  return {
    state,
    hydrated,
    isOpen,
    showFab,
    showChecklist,
    setStep,
    minimize,
    expand,
    dismiss,
    complete,
    reopen,
    dismissChecklist,
    completeChecklistItem,
  };
}
