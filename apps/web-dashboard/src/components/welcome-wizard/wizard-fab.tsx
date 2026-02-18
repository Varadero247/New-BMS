'use client';

import { Sparkles } from 'lucide-react';

interface WizardFabProps {
  show: boolean;
  onClick: () => void;
}

export function WizardFab({ show, onClick }: WizardFabProps) {
  if (!show) return null;

  return (
    <button
      onClick={onClick}
      className="fixed bottom-8 left-8 z-50 flex items-center gap-2 px-4 py-3 rounded-full bg-[var(--blue-mid,#3b82f6)] text-white shadow-lg hover:opacity-90 transition-opacity group animate-fab-entrance"
      title="Reopen Discovery Guide"
    >
      <Sparkles className="h-5 w-5" />
      <span className="text-sm font-medium">Discovery Guide</span>
      <style jsx>{`
        @keyframes fab-entrance {
          0% {
            transform: scale(0.8);
            opacity: 0;
          }
          50% {
            transform: scale(1.05);
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }
        .animate-fab-entrance {
          animation: fab-entrance 0.4s ease-out;
        }
      `}</style>
    </button>
  );
}
