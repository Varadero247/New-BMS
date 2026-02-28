import Link from 'next/link';
import { BookOpen, Award, ClipboardCheck, ChevronRight, Shield, Users, Database, Zap } from 'lucide-react';

const highlights = [
  { icon: Users, label: '7 Core Modules', desc: 'User Mgmt, RBAC, Integrations, Audit, Backup, Updates' },
  { icon: ClipboardCheck, label: '14 CPD Hours', desc: 'Two full days, instructor-led or self-paced' },
  { icon: Award, label: 'Nexara Certificate', desc: 'Pass 75% · Distinction 90%' },
  { icon: Shield, label: '3 Assessments', desc: 'Diagnostic, formative, and summative' },
];

const quickLinks = [
  { href: '/programme', label: 'View Full Programme', icon: BookOpen, colour: 'bg-[#1E3A5F]' },
  { href: '/modules', label: 'Browse Modules', icon: Zap, colour: 'bg-[#1E3A5F]' },
  { href: '/assessments', label: 'Take Assessment', icon: ClipboardCheck, colour: 'bg-[#B8860B]' },
  { href: '/certificate', label: 'Get Certificate', icon: Award, colour: 'bg-[#1E4A2F]' },
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
          <Link href="/modules" className="text-sm text-slate-300 hover:text-white transition-colors">Modules</Link>
          <Link href="/assessments" className="text-sm text-slate-300 hover:text-white transition-colors">Assessments</Link>
          <Link href="/certificate" className="text-sm text-slate-300 hover:text-white transition-colors">Certificate</Link>
          <Link href="/admin" className="text-sm text-slate-300 hover:text-white transition-colors">Admin</Link>
          <Link href="/login" className="text-sm bg-[#B8860B] text-white px-3 py-1.5 rounded hover:bg-[#D4A017] transition-colors">
            Sign In
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="px-6 py-20 text-center max-w-4xl mx-auto">
        <div className="inline-block bg-[#B8860B]/20 text-[#D4A017] text-sm font-medium px-3 py-1 rounded-full mb-6 border border-[#B8860B]/30">
          Nexara Certified Platform Administrator
        </div>
        <h1 className="text-5xl font-bold text-white mb-6 leading-tight" style={{ fontFamily: 'Montserrat, sans-serif' }}>
          Role-Based Administrator<br />Training Programme
        </h1>
        <p className="text-xl text-slate-300 mb-10 leading-relaxed">
          A two-day, instructor-led programme covering the complete Nexara IMS administration lifecycle.
          Complete modules, assessments, and earn your Nexara certificate.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/programme"
            className="inline-flex items-center gap-2 bg-[#B8860B] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#D4A017] transition-colors"
          >
            View Programme <ChevronRight className="w-4 h-4" />
          </Link>
          <Link
            href="/modules"
            className="inline-flex items-center gap-2 border border-[#1E3A5F] text-slate-300 px-6 py-3 rounded-lg font-semibold hover:border-[#B8860B] hover:text-white transition-colors"
          >
            Browse Modules
          </Link>
        </div>
      </section>

      {/* Highlights */}
      <section className="px-6 py-12 max-w-5xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {highlights.map(({ icon: Icon, label, desc }) => (
            <div key={label} className="bg-[#1E3A5F]/30 border border-[#1E3A5F] rounded-xl p-5">
              <Icon className="w-6 h-6 text-[#B8860B] mb-3" />
              <div className="font-semibold text-white mb-1">{label}</div>
              <div className="text-sm text-slate-400">{desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Quick Links */}
      <section className="px-6 py-12 max-w-5xl mx-auto">
        <h2 className="text-2xl font-bold text-white mb-6">Get Started</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickLinks.map(({ href, label, icon: Icon, colour }) => (
            <Link
              key={href}
              href={href}
              className={`${colour} rounded-xl p-5 flex flex-col gap-3 hover:opacity-90 transition-opacity border border-white/10`}
            >
              <Icon className="w-6 h-6 text-white" />
              <span className="font-semibold text-white">{label}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Schedule Card */}
      <section className="px-6 py-12 max-w-5xl mx-auto">
        <div className="bg-[#091628] border border-[#1E3A5F] rounded-2xl p-8">
          <h2 className="text-2xl font-bold text-white mb-6">Programme at a Glance</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <div className="text-[#B8860B] font-semibold mb-3">Day 1 — Platform Foundations</div>
              <ul className="space-y-2 text-sm text-slate-300">
                <li className="flex gap-2"><span className="text-slate-500 w-24 shrink-0">09:00–10:30</span> Module 1: User Management & SCIM</li>
                <li className="flex gap-2"><span className="text-slate-500 w-24 shrink-0">10:45–12:15</span> Module 2: Roles & Permissions</li>
                <li className="flex gap-2"><span className="text-slate-500 w-24 shrink-0">13:00–14:30</span> Module 3: Module Activation</li>
                <li className="flex gap-2"><span className="text-slate-500 w-24 shrink-0">14:45–16:15</span> Module 4: Integration Management</li>
                <li className="flex gap-2"><span className="text-slate-500 w-24 shrink-0">16:15–16:45</span> Day 1 Formative Assessment</li>
              </ul>
            </div>
            <div>
              <div className="text-[#B8860B] font-semibold mb-3">Day 2 — Operations & Maintenance</div>
              <ul className="space-y-2 text-sm text-slate-300">
                <li className="flex gap-2"><span className="text-slate-500 w-24 shrink-0">09:00–10:30</span> Module 5: Audit Log Review</li>
                <li className="flex gap-2"><span className="text-slate-500 w-24 shrink-0">10:45–12:15</span> Module 6: Backup & Restore</li>
                <li className="flex gap-2"><span className="text-slate-500 w-24 shrink-0">13:00–14:00</span> Module 7: Platform Updates</li>
                <li className="flex gap-2"><span className="text-slate-500 w-24 shrink-0">14:15–15:15</span> Summative Assessment</li>
                <li className="flex gap-2"><span className="text-slate-500 w-24 shrink-0">16:15–16:30</span> Certificate Ceremony</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#1E3A5F] px-6 py-8 mt-8">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-sm text-slate-500">© 2026 Nexara DMCC. All rights reserved.</div>
          <div className="flex gap-6">
            <Link href="/login" className="text-sm text-slate-500 hover:text-slate-300 transition-colors">Facilitator Login</Link>
            <Link href="/admin" className="text-sm text-slate-500 hover:text-slate-300 transition-colors">Admin Dashboard</Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
