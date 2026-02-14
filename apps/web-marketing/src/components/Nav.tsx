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
      style={{ background: 'var(--glass, rgba(10, 15, 30, 0.75))' }}
      aria-label="Main navigation"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-2.5 flex-shrink-0 group"
            aria-label="Resolvex home"
          >
            <span className="bg-navy rounded-lg px-2 py-1 font-display font-bold text-white text-base leading-none group-hover:bg-navy/80 transition-colors">
              R
            </span>
            <span className="font-display font-bold text-white text-lg leading-none">
              Resolvex
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
              className="px-4 py-2 text-sm font-body font-medium bg-teal text-white hover:bg-teal/90 rounded-lg transition-all duration-150"
            >
              Sign in →
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
        <div className="md:hidden border-t border-white/10 bg-navy/95 backdrop-blur-xl px-4 py-4 flex flex-col gap-2">
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
              className="px-4 py-2.5 text-sm font-body font-medium text-center bg-teal text-white hover:bg-teal/90 rounded-lg transition-colors"
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
