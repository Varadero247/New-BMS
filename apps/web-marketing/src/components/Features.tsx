'use client';

import { Shield, ClipboardCheck, BarChart3, Zap, FileCheck, Bot } from 'lucide-react';

interface Feature {
  iconBg: string;
  icon: React.ReactNode;
  title: string;
  tag: string;
  tagColor: string;
  description: string;
}

const features: Feature[] = [
  {
    iconBg: 'bg-teal/10',
    icon: <Shield className="w-6 h-6 text-teal" />,
    title: 'Unified Risk Register',
    tag: 'AI-POWERED',
    tagColor: 'text-teal',
    description:
      'Centralise risks across all standards with AI-powered scoring and automated escalation.',
  },
  {
    iconBg: 'bg-warning-500/10',
    icon: <ClipboardCheck className="w-6 h-6 text-warning-500" />,
    title: 'Audit Management',
    tag: 'ISO ALIGNED',
    tagColor: 'text-warning-500',
    description:
      'Plan, execute and track audits across 29 standards with evidence linking.',
  },
  {
    iconBg: 'bg-brand-700/10',
    icon: <BarChart3 className="w-6 h-6 text-brand-400" />,
    title: 'Real-time Dashboards',
    tag: 'LIVE DATA',
    tagColor: 'text-info-500',
    description:
      'Live compliance scores, trend analysis and executive reporting.',
  },
  {
    iconBg: 'bg-gray-400/10',
    icon: <Zap className="w-6 h-6 text-gray-400" />,
    title: 'Action & CAPA Tracking',
    tag: 'AUTOMATED',
    tagColor: 'text-gray-400',
    description:
      'Automated workflows for corrective actions with root cause analysis.',
  },
  {
    iconBg: 'bg-success-600/10',
    icon: <FileCheck className="w-6 h-6 text-success-500" />,
    title: 'Document Control',
    tag: 'E-SIGN READY',
    tagColor: 'text-sage',
    description:
      'Version-controlled documents with electronic signatures and approval workflows.',
  },
  {
    iconBg: 'bg-teal/10',
    icon: <Bot className="w-6 h-6 text-teal" />,
    title: 'AI Compliance Assistant',
    tag: 'BETA',
    tagColor: 'text-teal',
    description:
      'Natural language queries across your compliance data. Ask anything.',
  },
];

export default function Features() {
  return (
    <section className="max-w-7xl mx-auto py-24 px-6">
      {/* Section header */}
      <h2 className="font-display text-4xl font-bold text-white text-center">
        Everything you need to stay compliant
      </h2>
      <p className="text-gray-400 text-center max-w-2xl mx-auto mt-4 font-body">
        One platform for every standard, every audit, every action — from gap analysis to board-level
        reporting.
      </p>

      {/* Feature grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-[2px] bg-white/10 rounded-2xl overflow-hidden mt-16">
        {features.map((feature) => (
          <div
            key={feature.title}
            className="feature-cell bg-surface-dark-alt p-8 hover:bg-gray-800 transition-colors relative group"
          >
            {/* Top accent bar */}
            <div
              className="accent-bar absolute top-0 left-0 right-0 h-0.5 bg-teal origin-left"
              style={{ transform: 'scaleX(0)', transition: 'transform 300ms ease' }}
            />

            {/* Icon */}
            <div
              className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${feature.iconBg}`}
            >
              {feature.icon}
            </div>

            {/* Title */}
            <h3 className="font-display text-lg font-semibold text-white">{feature.title}</h3>

            {/* Tag */}
            <p className={`font-mono text-xs tracking-wider uppercase mt-2 ${feature.tagColor}`}>
              {feature.tag}
            </p>

            {/* Description */}
            <p className="text-sm text-gray-400 mt-3 font-body leading-relaxed">
              {feature.description}
            </p>
          </div>
        ))}
      </div>

      {/* CSS for hover accent bar animation */}
      <style jsx global>{`
        .feature-cell:hover .accent-bar {
          transform: scaleX(1) !important;
        }
      `}</style>
    </section>
  );
}
