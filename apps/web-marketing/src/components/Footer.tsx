'use client';

import Link from 'next/link';

const productLinks = [
  { label: 'Overview', href: '/platform' },
  { label: 'Features', href: '/platform#features' },
  { label: 'Pricing', href: '/pricing' },
  { label: 'Changelog', href: '/changelog' },
  { label: 'Documentation', href: '/docs' },
];

const standardsLinks = [
  { label: 'ISO 9001', href: '/standards/iso-9001' },
  { label: 'ISO 14001', href: '/standards/iso-14001' },
  { label: 'ISO 45001', href: '/standards/iso-45001' },
  { label: 'ISO 27001', href: '/standards/iso-27001' },
  { label: 'All Standards', href: '/standards' },
];

const companyLinks = [
  { label: 'About', href: '/about' },
  { label: 'Careers', href: '/careers' },
  { label: 'Blog', href: '/blog' },
  { label: 'Contact', href: '/contact' },
  { label: 'Partners', href: '/partners' },
];

const legalLinks = [
  { label: 'Privacy Policy', href: '/legal/privacy' },
  { label: 'Terms of Service', href: '/legal/terms' },
  { label: 'Cookie Policy', href: '/legal/cookies' },
  { label: 'DPA', href: '/legal/dpa' },
  { label: 'Security', href: '/security' },
];

interface FooterColumnProps {
  title: string;
  links: Array<{ label: string; href: string }>;
}

function FooterColumn({ title, links }: FooterColumnProps) {
  return (
    <div>
      <h3 className="text-white text-sm font-display font-semibold">{title}</h3>
      <ul className="mt-4 space-y-3">
        {links.map((link) => (
          <li key={link.label}>
            <Link
              href={link.href}
              className="text-white/35 hover:text-white text-sm font-body transition-colors duration-150"
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

const certBadges = ['ISO 27001', 'SOC 2 TYPE II', 'GDPR'];

export default function Footer() {
  return (
    <footer className="bg-surface-dark-alt border-t border-white/[0.06] py-16">
      <div className="max-w-7xl mx-auto px-6">
        {/* Main grid */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
          {/* Brand column */}
          <div className="col-span-2 md:col-span-1">
            {/* Logo */}
            <div className="bg-teal rounded-lg w-8 h-8 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
              R
            </div>
            <p className="font-display text-white mt-3 font-semibold">Nexara IMS</p>
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-2 font-body leading-relaxed">
              Unified compliance intelligence for modern enterprises.
            </p>
          </div>

          {/* Link columns */}
          <FooterColumn title="Product" links={productLinks} />
          <FooterColumn title="Standards" links={standardsLinks} />
          <FooterColumn title="Company" links={companyLinks} />
          <FooterColumn title="Legal" links={legalLinks} />
        </div>

        {/* Divider + bottom row */}
        <div className="border-t border-white/[0.06] mt-12 pt-8 flex justify-between items-center flex-wrap gap-4">
          {/* Copyright */}
          <p className="text-white/35 text-sm font-body">
            &copy; 2026 Nexara DMCC. All rights reserved.
          </p>

          {/* Cert badges */}
          <div className="flex gap-3 flex-wrap">
            {certBadges.map((badge) => (
              <span
                key={badge}
                className="border border-white/10 text-white/30 text-xs font-mono px-3 py-1 rounded-full"
              >
                {badge}
              </span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
