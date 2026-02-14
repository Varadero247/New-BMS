'use client';

import { useScrollReveal } from '@/hooks/useScrollReveal';
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

  return (
    <>
      <CustomCursor />
      <AnnouncementBar />
      <Nav />
      <main>
        <Hero />
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
    </>
  );
}
