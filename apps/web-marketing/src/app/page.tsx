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
      </main>
      <Footer />

      {/* Login modal — triggered by hero CTAs */}
      <LoginModal isOpen={loginOpen} onClose={() => setLoginOpen(false)} defaultEnv="local" />
    </>
  );
}
