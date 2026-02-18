import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { isoStandards } from '@/data/iso-standards';

interface Props {
  params: Promise<{ standard: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { standard } = await params;
  const iso = isoStandards[standard];
  if (!iso) return { title: 'Not Found' };

  return {
    title: `${iso.number} ${iso.name} Software | Nexara IMS`,
    description: `${iso.subtitle} Manage ${iso.number} compliance with Nexara — the AI-powered integrated management system.`,
    openGraph: {
      title: `${iso.number} ${iso.name} | Nexara`,
      description: iso.subtitle,
      url: `https://nexara.io/iso/${standard}`,
      siteName: 'Nexara IMS',
      locale: 'en_GB',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${iso.number} ${iso.name} | Nexara`,
      description: iso.subtitle,
    },
  };
}

export function generateStaticParams() {
  return Object.keys(isoStandards).map((standard) => ({ standard }));
}

export default async function ISOStandardPage({ params }: Props) {
  const { standard } = await params;
  const iso = isoStandards[standard];
  if (!iso) notFound();

  return (
    <main className="min-h-screen bg-[#0B1120] text-gray-100">
      {/* Navigation */}
      <div className="border-b border-white/10">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="text-xl font-semibold tracking-tight text-white font-display">
            Nexara
          </Link>
          <div className="flex items-center gap-6">
            <Link
              href="/roi-calculator"
              className="text-sm text-gray-400 dark:text-gray-500 hover:text-white transition-colors"
            >
              ROI Calculator
            </Link>
            <Link
              href="/signup"
              className="text-sm px-4 py-2 rounded-lg bg-[#1B3A6B] hover:bg-[#244d8a] text-white transition"
            >
              Start free trial
            </Link>
          </div>
        </div>
      </div>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-6 pt-20 pb-16 text-center">
        <p className="text-sm font-medium text-[#60A5FA] uppercase tracking-wider mb-4">
          {iso.number}
        </p>
        <h1 className="text-4xl md:text-5xl font-bold font-display text-white mb-4 leading-tight">
          {iso.name}
        </h1>
        <p className="text-lg text-gray-400 dark:text-gray-500 max-w-2xl mx-auto mb-8">
          {iso.subtitle}
        </p>
        <div className="flex items-center justify-center gap-4">
          <Link
            href={`/signup?source=iso-${standard}`}
            className="px-6 py-3 rounded-lg bg-[#1B3A6B] hover:bg-[#244d8a] text-white font-semibold transition"
          >
            Start free 21-day trial
          </Link>
          <Link
            href="/roi-calculator"
            className="px-6 py-3 rounded-lg border border-white/10 hover:border-white/20 text-gray-300 hover:text-white transition"
          >
            Calculate ROI
          </Link>
        </div>
      </section>

      {/* Requirements */}
      <section className="max-w-4xl mx-auto px-6 py-16">
        <h2 className="text-2xl font-bold font-display text-white mb-8 text-center">
          What {iso.number} requires
        </h2>
        <div className="space-y-4">
          {iso.requirements.map((req, i) => (
            <div
              key={i}
              className="flex items-start gap-4 rounded-xl border border-white/10 bg-white/[0.02] p-5"
            >
              <div className="shrink-0 w-8 h-8 rounded-lg bg-[#1B3A6B]/30 flex items-center justify-center text-[#60A5FA] font-bold text-sm">
                {i + 1}
              </div>
              <p className="text-gray-300 leading-relaxed">{req}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features (3 cards) */}
      <section className="bg-white/[0.02] border-y border-white/10">
        <div className="max-w-6xl mx-auto px-6 py-16">
          <h2 className="text-2xl font-bold font-display text-white mb-10 text-center">
            How Nexara helps
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {iso.features.map((feature, i) => (
              <div key={i} className="rounded-xl border border-white/10 bg-[#0B1120] p-6">
                <div className="w-10 h-10 rounded-lg bg-[#1B3A6B]/30 flex items-center justify-center mb-4">
                  <svg
                    className="w-5 h-5 text-[#60A5FA]"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
                <p className="text-gray-400 dark:text-gray-500 text-sm leading-relaxed">
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Key Features (6 tiles) */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        <h2 className="text-2xl font-bold font-display text-white mb-10 text-center">
          Key features
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {iso.keyFeatures.map((kf, i) => (
            <div
              key={i}
              className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.02] px-5 py-4"
            >
              <svg
                className="w-5 h-5 text-[#34D399] shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
              <span className="text-gray-200 text-sm">{kf}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Industry examples */}
      <section className="bg-white/[0.02] border-y border-white/10">
        <div className="max-w-4xl mx-auto px-6 py-16 text-center">
          <h2 className="text-2xl font-bold font-display text-white mb-4">
            Trusted by {iso.industries[0]} &amp; {iso.industries[1]} organisations
          </h2>
          <p className="text-gray-400 dark:text-gray-500 mb-10">
            Nexara is used by companies in {iso.industries[0].toLowerCase()},{' '}
            {iso.industries[1].toLowerCase()}, and dozens more industries to manage {iso.number}{' '}
            compliance.
          </p>
          <div className="flex items-center justify-center gap-4">
            {iso.industries.map((industry) => (
              <span
                key={industry}
                className="px-4 py-2 rounded-full border border-white/10 text-sm text-gray-300"
              >
                {industry}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonial placeholders */}
      <section className="max-w-4xl mx-auto px-6 py-16">
        <h2 className="text-2xl font-bold font-display text-white mb-10 text-center">
          What our customers say
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2].map((n) => (
            <div key={n} className="rounded-xl border border-white/10 bg-white/[0.02] p-6">
              <div className="flex items-center gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <svg
                    key={i}
                    className="w-4 h-4 text-yellow-500"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <p className="text-gray-400 dark:text-gray-500 text-sm italic mb-4 leading-relaxed">
                &ldquo;Nexara transformed how we manage {iso.number}. What used to take weeks now
                takes hours.&rdquo;
              </p>
              <div>
                <p className="text-white text-sm font-semibold">Customer Name</p>
                <p className="text-gray-500 dark:text-gray-400 text-xs">
                  {iso.industries[n - 1]} &mdash; Quality Manager
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Final CTA */}
      <section className="max-w-4xl mx-auto px-6 py-20 text-center">
        <h2 className="text-3xl font-bold font-display text-white mb-4">
          Ready to simplify {iso.number}?
        </h2>
        <p className="text-gray-400 dark:text-gray-500 mb-8 max-w-xl mx-auto">
          Join thousands of organisations managing {iso.number} compliance with Nexara. Start your
          free 21-day trial today.
        </p>
        <Link
          href={`/signup?source=iso-${standard}`}
          className="inline-block px-8 py-3.5 rounded-lg bg-[#1B3A6B] hover:bg-[#244d8a] text-white font-semibold transition"
        >
          Start your free 21-day trial
        </Link>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 py-8">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-gray-500 dark:text-gray-400">
          <p>&copy; {new Date().getFullYear()} Nexara. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <Link href="/privacy" className="hover:text-white transition-colors">
              Privacy
            </Link>
            <Link href="/terms" className="hover:text-white transition-colors">
              Terms
            </Link>
            <Link href="/" className="hover:text-white transition-colors">
              Home
            </Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
