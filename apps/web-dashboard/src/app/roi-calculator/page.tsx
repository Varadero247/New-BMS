import type { Metadata } from 'next';
import { RoiCalculator } from '@/components/roi/RoiCalculator';

export const metadata: Metadata = {
  title: 'ROI Calculator — Nexara IMS',
  description: 'Calculate your return on investment with Nexara. See how much time and money your organisation can save on compliance, audits, and supplier management.',
};

export default function RoiCalculatorPage() {
  return <RoiCalculator />;
}
