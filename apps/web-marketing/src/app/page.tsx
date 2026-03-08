'use client';

import { useState } from 'react';
import { useScrollReveal } from '@/hooks/useScrollReveal';
import { LoginModal } from '@ims/ui';
import AnnouncementBar from '@/components/AnnouncementBar';
import Nav from '@/components/Nav';
import Hero from '@/components/Hero';
import Ticker from '@/components/Ticker';
import StandardsStrip from '@/components/StandardsStrip';
import Features from '@/components/Features';
import DashboardPreview from '@/components/DashboardPreview';
import ComplianceTracker from '@/components/ComplianceTracker';
import Articles from '@/components/Articles';
import Testimonials from '@/components/Testimonials';
import CTASection from '@/components/CTASection';
import Footer from '@/components/Footer';
import CustomCursor from '@/components/CustomCursor';
import Link from 'next/link';
import { PRICING } from '@/lib/pricing';

export default function Home() {
  useScrollReveal();
  const [loginOpen, setLoginOpen] = useState(false);

  return (
    <>
      <CustomCursor />
      <AnnouncementBar />
      <Nav onOpenLogin={() => setLoginOpen(true)} />
      <main>
        <Hero onOpenLogin={() => setLoginOpen(true)} />
        <Ticker />
        <StandardsStrip />
        <Features />
        <DashboardPreview />
        <ComplianceTracker />
        <Articles />
        <Testimonials />
        <CTASection />

        {/* Pricing callout — additive section */}
        <section className="max-w-5xl mx-auto px-6 pb-16">
          <div className="rounded-2xl bg-gradient-to-r from-[#1B3A6B]/40 to-[#0B1120] border border-[#1B3A6B]/30 p-8 md:p-10 text-center">
            <p className="text-sm font-medium text-[#60A5FA] uppercase tracking-wider mb-3">Transparent pricing</p>
            <h2 className="text-3xl font-bold text-white mb-3">
              From £{PRICING.tiers.ENTERPRISE.listPriceMonthly}/user/month (Enterprise)
            </h2>
            <p className="text-gray-400 mb-2">
              14-day free trial — no commitment.
            </p>
            <p className="text-gray-400 mb-8 max-w-xl mx-auto">
              Save £{(PRICING.competitorBenchmarks.nexaraSavingVsIncumbentLow / 1000).toFixed(0)}k–£{(PRICING.competitorBenchmarks.nexaraSavingVsIncumbentHigh / 1000).toFixed(0)}k/year vs your incumbent stack.
              One platform for every standard. No per-module fees.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/lp/free-trial"
                className="px-8 py-3.5 rounded-lg bg-[#1B3A6B] hover:bg-[#244d8a] text-white font-semibold transition"
              >
                Start free trial
              </Link>
              <Link
                href="/pricing"
                className="px-8 py-3.5 rounded-lg border border-white/20 hover:border-white/40 text-white font-semibold transition"
              >
                View pricing
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />

      {/* Login modal — triggered by hero CTAs */}
      <LoginModal isOpen={loginOpen} onClose={() => setLoginOpen(false)} defaultEnv="local" />
    </>
  );
}
