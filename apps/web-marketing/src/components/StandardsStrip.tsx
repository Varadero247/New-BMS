'use client';
import { useState } from 'react';

const STANDARDS = [
  'ISO 9001',
  'ISO 14001',
  'ISO 45001',
  'ISO 27001',
  'ISO 22001',
  'ISO 37001',
  'ISO 42001',
  'ISO 50001',
  'GDPR',
  'ESG',
];

export default function StandardsStrip() {
  const [active, setActive] = useState('ISO 9001');

  return (
    <section aria-label="Supported standards" className="border-t border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <p className="text-sm font-mono text-gray-500 uppercase tracking-wider mb-6">
          Standards we support
        </p>

        <div className="flex flex-wrap gap-3 items-center">
          {STANDARDS.map((standard) => {
            const isActive = active === standard;
            return (
              <button
                key={standard}
                onClick={() => setActive(standard)}
                aria-pressed={isActive}
                className={`px-4 py-2 rounded-full text-sm font-mono transition-all duration-150 border focus:outline-none focus:ring-2 focus:ring-teal/40 ${
                  isActive
                    ? 'bg-teal text-white border-teal shadow-md shadow-teal/20'
                    : 'border-white/20 text-gray-400 hover:text-white hover:border-white/40 bg-transparent'
                }`}
              >
                {standard}
              </button>
            );
          })}

          <span
            className="text-teal text-sm font-mono cursor-pointer hover:text-teal/80 transition-colors ml-1"
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                // Navigate to standards page
                window.location.href = '/standards';
              }
            }}
            onClick={() => (window.location.href = '/standards')}
            aria-label="View all 29 supported standards"
          >
            +19 more →
          </span>
        </div>
      </div>
    </section>
  );
}
