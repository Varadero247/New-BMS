'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';

const NAV_LINKS = [
  { label: 'Platform', href: '/platform' },
  { label: 'Solutions', href: '/solutions' },
  { label: 'Standards', href: '/standards' },
  { label: 'Resources', href: '/resources' },
  { label: 'Pricing', href: '/pricing' },
];

export default function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 60);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 border-b border-white/[0.08] backdrop-blur-xl transition-shadow duration-300 ${
        scrolled ? 'shadow-lg' : ''
      }`}
      style={{ background: 'rgba(8, 11, 18, 0.75)' }}
      aria-label="Main navigation"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-2.5 flex-shrink-0 group"
            aria-label="Nexara home"
          >
            <svg width="28" height="28" viewBox="0 0 80 80" fill="none" aria-hidden="true">
              <path d="M 40 16 A 24 24 0 1 1 19.5 57.2" stroke="url(#navG)" strokeWidth="2" strokeDasharray="5 3.5" strokeLinecap="round" opacity="0.55"/>
              <path d="M 40 26 A 14 14 0 1 1 26.9 50.9" stroke="url(#navG)" strokeWidth="2.5" strokeLinecap="round" opacity="0.8"/>
              <circle cx="40" cy="40" r="5.5" fill="url(#navG)"/>
              <circle cx="40" cy="40" r="2.5" fill="white" opacity="0.92"/>
              <defs>
                <linearGradient id="navG" x1="0" y1="0" x2="80" y2="80" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#3B78F5"/><stop offset="60%" stopColor="#5B94FF"/><stop offset="100%" stopColor="#00C4A8"/>
                </linearGradient>
              </defs>
            </svg>
            <span style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, letterSpacing: '-0.03em', color: 'var(--white, #EDF3FC)' }} className="text-lg leading-none">
              nexara
            </span>
          </Link>

          {/* Desktop nav links */}
          <div className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="px-4 py-2 text-sm font-body text-white/70 hover:text-white rounded-lg hover:bg-white/5 transition-all duration-150"
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* CTA buttons */}
          <div className="hidden md:flex items-center gap-3">
            <Link
              href="/demo"
              className="px-4 py-2 text-sm font-body font-medium border border-white/20 text-white/70 hover:text-white hover:border-white/40 rounded-lg transition-all duration-150"
            >
              Request demo
            </Link>
            <Link
              href="/auth/login"
              className="px-4 py-2 text-sm font-medium text-white rounded-lg transition-all duration-150"
              style={{ background: 'var(--g-brand)', fontFamily: "'Syne', sans-serif", fontWeight: 700 }}
            >
              Sign in &rarr;
            </Link>
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden text-white/70 hover:text-white p-2 rounded-lg hover:bg-white/5 transition-colors"
            onClick={() => setMobileOpen((prev) => !prev)}
            aria-expanded={mobileOpen}
            aria-label="Toggle mobile menu"
          >
            {mobileOpen ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t px-4 py-4 flex flex-col gap-2" style={{ borderColor: 'var(--border, #1E2E48)', background: 'rgba(8,11,18,0.95)', backdropFilter: 'blur(16px)' }}>
          {NAV_LINKS.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="px-4 py-2.5 text-sm font-body text-white/70 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
              onClick={() => setMobileOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          <div className="flex flex-col gap-2 mt-2 pt-2 border-t border-white/10">
            <Link
              href="/demo"
              className="px-4 py-2.5 text-sm font-body font-medium text-center border border-white/20 text-white/70 hover:text-white rounded-lg transition-colors"
              onClick={() => setMobileOpen(false)}
            >
              Request demo
            </Link>
            <Link
              href="/auth/login"
              className="px-4 py-2.5 text-sm font-medium text-center text-white rounded-lg transition-colors"
              style={{ background: 'var(--g-brand)', fontFamily: "'Syne', sans-serif", fontWeight: 700 }}
              onClick={() => setMobileOpen(false)}
            >
              Sign in →
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
