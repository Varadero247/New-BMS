'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@ims/ui';
import { Shield, FileText, Users, AlertTriangle, Lock } from 'lucide-react';
import Link from 'next/link';
import { api } from '@/lib/api';

interface SecurityDashboard {
  total: number;
  fullyImplemented: number;
  partiallyImplemented: number;
  notImplemented: number;
  overallCompliancePercent: number;
  administrative: { count: number; compliancePercent: number };
  physical: { count: number; compliancePercent: number };
  technical: { count: number; compliancePercent: number };
}

interface BreachDashboard {
  total: number;
  open: number;
  notified: number;
  closed: number;
}

interface PrivacyStats {
  totalPolicies: number;
  activePolicies: number;
  disclosuresThisYear: number;
  trainingCompletionsThisYear: number;
}

interface BaaStats {
  total: number;
  active: number;
  expired: number;
  pendingSignature: number;
}

export default function HipaaPage() {
  const [securityDash, setSecurityDash] = useState<SecurityDashboard | null>(null);
  const [breachDash, setBreachDash] = useState<BreachDashboard | null>(null);
  const [privacyStats, setPrivacyStats] = useState<PrivacyStats | null>(null);
  const [baaStats, setBaaStats] = useState<BaaStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/hipaa/security/dashboard').then((r) => r.data.data),
      api.get('/hipaa/breach/dashboard').then((r) => r.data.data),
      api.get('/hipaa/privacy/stats').then((r) => r.data.data),
      api.get('/hipaa/baa/stats').then((r) => r.data.data),
    ])
      .then(([sec, breach, privacy, baa]) => {
        setSecurityDash(sec);
        setBreachDash(breach);
        setPrivacyStats(privacy);
        setBaaStats(baa);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const pctColor = (pct: number) =>
    pct >= 80 ? 'text-green-600' : pct >= 50 ? 'text-yellow-600' : 'text-red-600';

  const modules = [
    {
      href: '/hipaa/privacy',
      icon: FileText,
      title: 'Privacy Rule',
      subtitle: '45 CFR §164.500–§164.534',
      color: 'bg-blue-50 border-blue-200',
      iconColor: 'text-blue-600',
    },
    {
      href: '/hipaa/baa',
      icon: Users,
      title: 'Business Associates',
      subtitle: '45 CFR §164.308(b)',
      color: 'bg-purple-50 border-purple-200',
      iconColor: 'text-purple-600',
    },
    {
      href: '/hipaa/security',
      icon: Lock,
      title: 'Security Rule',
      subtitle: '45 CFR §164.302–§164.318',
      color: 'bg-green-50 border-green-200',
      iconColor: 'text-green-600',
    },
    {
      href: '/hipaa/breach',
      icon: AlertTriangle,
      title: 'Breach Notification',
      subtitle: '45 CFR §164.400–§164.414',
      color: 'bg-red-50 border-red-200',
      iconColor: 'text-red-600',
    },
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-3">
        <Shield className="w-8 h-8 text-blue-600" />
        <div>
          <h1 className="text-2xl font-bold text-gray-900">HIPAA Compliance</h1>
          <p className="text-sm text-gray-500">Health Insurance Portability and Accountability Act — 45 CFR Parts 160 &amp; 164</p>
        </div>
      </div>

      {loading ? (
        <p className="text-gray-500 text-sm">Loading dashboard…</p>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <p className="text-sm text-gray-500">Security Compliance</p>
                <p className={`text-3xl font-bold ${pctColor(securityDash?.overallCompliancePercent ?? 0)}`}>
                  {securityDash?.overallCompliancePercent ?? 0}%
                </p>
                <p className="text-xs text-gray-400">{securityDash?.fullyImplemented}/{securityDash?.total} controls implemented</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <p className="text-sm text-gray-500">Active Breaches</p>
                <p className={`text-3xl font-bold ${(breachDash?.open ?? 0) > 0 ? 'text-red-600' : 'text-green-600'}`}>
                  {breachDash?.open ?? 0}
                </p>
                <p className="text-xs text-gray-400">{breachDash?.total ?? 0} total breach records</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <p className="text-sm text-gray-500">Active BAAs</p>
                <p className="text-3xl font-bold text-purple-600">{baaStats?.active ?? 0}</p>
                <p className="text-xs text-gray-400">{baaStats?.expired ?? 0} expired, {baaStats?.pendingSignature ?? 0} pending</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <p className="text-sm text-gray-500">Disclosures (YTD)</p>
                <p className="text-3xl font-bold text-blue-600">{privacyStats?.disclosuresThisYear ?? 0}</p>
                <p className="text-xs text-gray-400">{privacyStats?.trainingCompletionsThisYear ?? 0} training completions</p>
              </CardContent>
            </Card>
          </div>

          {securityDash && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Security Rule Compliance by Safeguard Category</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4">
                  {(['administrative', 'physical', 'technical'] as const).map((cat) => (
                    <div key={cat} className="text-center">
                      <p className="text-sm font-medium text-gray-600 capitalize">{cat}</p>
                      <p className={`text-2xl font-bold ${pctColor(securityDash[cat].compliancePercent)}`}>
                        {securityDash[cat].compliancePercent}%
                      </p>
                      <p className="text-xs text-gray-400">{securityDash[cat].count} controls</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {modules.map((mod) => (
          <Link key={mod.href} href={mod.href}>
            <Card className={`border ${mod.color} hover:shadow-md transition-shadow cursor-pointer`}>
              <CardContent className="p-5 flex items-center gap-4">
                <mod.icon className={`w-10 h-10 ${mod.iconColor} flex-shrink-0`} />
                <div>
                  <p className="font-semibold text-gray-900">{mod.title}</p>
                  <p className="text-xs text-gray-500">{mod.subtitle}</p>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
