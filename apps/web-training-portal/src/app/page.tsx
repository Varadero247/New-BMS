import Link from 'next/link';
import { ChevronRight, Clock, Award, Users, BookOpen, Shield, Settings, GraduationCap } from 'lucide-react';

const PROGRAMMES = [
  {
    href: '/programme',
    badge: 'Administrator Training',
    title: 'Nexara Certified Platform Administrator',
    desc: 'A two-day, instructor-led programme covering the complete Nexara IMS administration lifecycle: user management, RBAC, integrations, audit, backup, and platform updates.',
    stats: [
      { icon: Clock, label: '14 CPD hours' },
      { icon: BookOpen, label: '7 modules' },
      { icon: Award, label: 'Pass 75% · Distinction 90%' },
      { icon: Users, label: 'Max 16 participants' },
    ],
    ctaLabel: 'View Programme',
    secondary: { href: '/assessments', label: 'Take Assessment' },
    accent: 'border-[#B8860B]/40',
    iconBg: 'bg-[#B8860B]/20',
    icon: Settings,
    iconColour: 'text-[#B8860B]',
    badgeColour: 'text-[#D4A017]',
  },
  {
    href: '/module-owner',
    badge: 'Module Owner Training',
    title: 'Five Targeted One-Day Programmes',
    desc: 'Designed for compliance professionals and department heads who own and operate specific Nexara modules. Choose from Quality & NC, HSE, HR & Payroll, Finance & Contracts, or Advanced (Audits, CAPA & Management Review).',
    stats: [
      { icon: Clock, label: '7 CPD hours per day' },
      { icon: BookOpen, label: '5 specialist programmes' },
      { icon: Award, label: 'Certificate on ≥ 75%' },
      { icon: Users, label: 'Max 14 participants' },
    ],
    ctaLabel: 'Select Programme',
    secondary: null,
    accent: 'border-blue-700/40',
    iconBg: 'bg-blue-900/30',
    icon: Shield,
    iconColour: 'text-blue-400',
    badgeColour: 'text-blue-400',
  },
  {
    href: '/end-user',
    badge: 'End User Training',
    title: 'Nexara Platform Foundation',
    desc: 'A four-hour programme for operational staff. Learn how to record incidents, complete training acknowledgements, raise permits, log observations, and read your compliance dashboard. Available as a live virtual session or self-paced e-learning.',
    stats: [
      { icon: Clock, label: '4 CPD hours' },
      { icon: BookOpen, label: '6 modules' },
      { icon: Award, label: 'Certificate on ≥ 80%' },
      { icon: Users, label: 'No prerequisites' },
    ],
    ctaLabel: 'Start Training',
    secondary: { href: '/end-user/assessment', label: 'Take Assessment' },
    accent: 'border-green-700/40',
    iconBg: 'bg-green-900/30',
    icon: Users,
    iconColour: 'text-green-400',
    badgeColour: 'text-green-400',
  },
  {
    href: '/train-the-trainer',
    badge: 'Train-the-Trainer',
    title: 'Build Your Internal Training Capability',
    desc: 'A two-day programme for designated internal trainers. Earn the "Nexara Certified Internal Trainer" credential and deliver End User and all five Module Owner programmes independently — using Nexara's editable source materials, facilitation guides, and assessment tools.',
    stats: [
      { icon: Clock, label: '14 CPD hours' },
      { icon: BookOpen, label: 'Dual assessment' },
      { icon: Award, label: 'Written (75%) + Delivery (70%)' },
      { icon: Users, label: 'Max 8 participants' },
    ],
    ctaLabel: 'View Programme',
    secondary: null,
    accent: 'border-purple-700/40',
    iconBg: 'bg-purple-900/30',
    icon: GraduationCap,
    iconColour: 'text-purple-400',
    badgeColour: 'text-purple-400',
  },
];

export default function HomePage() {
  return (
    <main className="min-h-screen">
      {/* Nav */}
      <nav className="border-b border-[#1E3A5F] bg-[#091628] px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded bg-[#B8860B] flex items-center justify-center font-bold text-sm text-white">N</div>
          <span className="font-semibold text-white">Nexara IMS — Training Portal</span>
        </div>
        <div className="flex items-center gap-6">
          <Link href="/module-owner" className="text-sm text-slate-300 hover:text-white transition-colors">Module Owner</Link>
          <Link href="/end-user" className="text-sm text-slate-300 hover:text-white transition-colors">End User</Link>
          <Link href="/train-the-trainer" className="text-sm text-slate-300 hover:text-white transition-colors">Train-the-Trainer</Link>
          <Link href="/login" className="text-sm bg-[#B8860B] text-white px-3 py-1.5 rounded hover:bg-[#D4A017] transition-colors">
            Sign In
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="px-6 py-16 text-center max-w-4xl mx-auto">
        <div className="inline-block bg-[#B8860B]/20 text-[#D4A017] text-xs font-semibold px-3 py-1 rounded-full mb-5 border border-[#B8860B]/30 uppercase tracking-wide">
          Nexara Training Academy
        </div>
        <h1 className="text-5xl font-bold text-white mb-5 leading-tight" style={{ fontFamily: 'Montserrat, sans-serif' }}>
          Select Your Programme
        </h1>
        <p className="text-xl text-slate-300 mb-4 leading-relaxed max-w-2xl mx-auto">
          Four role-based training tracks — each with its own assessment and Nexara certificate.
          Attend only the programme that matches your role.
        </p>
      </section>

      {/* Programme Cards */}
      <section className="px-6 pb-16 max-w-5xl mx-auto">
        <div className="space-y-6">
          {PROGRAMMES.map(({ href, badge, title, desc, stats, ctaLabel, secondary, accent, iconBg, icon: Icon, iconColour, badgeColour }) => (
            <div key={href} className={`bg-[#091628] border ${accent} rounded-2xl p-8`}>
              <div className="flex flex-col md:flex-row gap-6">
                {/* Icon */}
                <div className={`w-14 h-14 rounded-xl ${iconBg} flex items-center justify-center shrink-0`}>
                  <Icon className={`w-7 h-7 ${iconColour}`} />
                </div>

                {/* Content */}
                <div className="flex-1">
                  <div className={`text-xs font-semibold uppercase tracking-wide ${badgeColour} mb-1`}>{badge}</div>
                  <h2 className="text-xl font-bold text-white mb-2">{title}</h2>
                  <p className="text-sm text-slate-400 mb-5 leading-relaxed">{desc}</p>

                  {/* Stats */}
                  <div className="flex flex-wrap gap-4 mb-5">
                    {stats.map(({ icon: StatIcon, label }) => (
                      <div key={label} className="flex items-center gap-1.5 text-sm text-slate-400">
                        <StatIcon className="w-3.5 h-3.5 text-[#B8860B]" />
                        {label}
                      </div>
                    ))}
                  </div>

                  {/* CTAs */}
                  <div className="flex flex-wrap gap-3">
                    <Link
                      href={href}
                      className="inline-flex items-center gap-2 bg-[#B8860B] text-white text-sm font-semibold px-5 py-2.5 rounded-lg hover:bg-[#D4A017] transition-colors"
                    >
                      {ctaLabel} <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                    {secondary && (
                      <Link
                        href={secondary.href}
                        className="inline-flex items-center gap-2 border border-[#1E3A5F] text-slate-300 text-sm px-5 py-2.5 rounded-lg hover:border-[#B8860B]/50 hover:text-white transition-colors"
                      >
                        {secondary.label}
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#1E3A5F] px-6 py-8 mt-4">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-sm text-slate-500">© 2026 Nexara DMCC. All rights reserved.</div>
          <div className="flex gap-6">
            <Link href="/login" className="text-sm text-slate-500 hover:text-slate-300 transition-colors">Facilitator Login</Link>
            <a href="mailto:training@nexara.io" className="text-sm text-slate-500 hover:text-slate-300 transition-colors">Request Access</a>
          </div>
        </div>
      </footer>
    </main>
  );
}
