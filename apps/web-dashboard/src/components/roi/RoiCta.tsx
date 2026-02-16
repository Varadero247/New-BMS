'use client';

import { Button } from '@ims/ui';
import { ArrowRight, Printer } from 'lucide-react';

export function RoiCta() {
  return (
    <div className="flex flex-col gap-3 sm:flex-row">
      <a href="/signup" className="flex-1">
        <Button className="w-full gap-2 text-base" size="lg">
          Start your free 30-day trial — no credit card required
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Button>
      </a>
      <Button
        variant="outline"
        size="lg"
        className="gap-2"
        onClick={() => window.print()}
      >
        <Printer className="h-4 w-4" aria-hidden="true" />
        Download as PDF
      </Button>
    </div>
  );
}
