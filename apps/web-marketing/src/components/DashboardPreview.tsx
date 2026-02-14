'use client';

const barHeights = ['h-4', 'h-6', 'h-8', 'h-5', 'h-10', 'h-7', 'h-9', 'h-full'];
const warningBarHeights = ['h-8', 'h-5', 'h-10', 'h-6', 'h-4', 'h-9', 'h-7', 'h-full'];

export default function DashboardPreview() {
  return (
    <section className="max-w-6xl mx-auto py-24 px-6">
      {/* Section header */}
      <div className="text-center">
        <h2 className="font-display text-4xl font-bold text-white">See Resolvex in action</h2>
        <p className="text-gray-400 mt-4 max-w-xl mx-auto font-body">
          A single pane of glass across all your compliance programmes. Built for compliance teams,
          loved by boards.
        </p>
      </div>

      {/* Browser chrome mockup */}
      <div className="bg-surface-dark-alt rounded-2xl shadow-2xl border border-white/10 overflow-hidden mt-16">
        {/* Title bar */}
        <div className="bg-gray-900 px-4 py-3 flex items-center">
          {/* Traffic lights */}
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <div className="w-3 h-3 rounded-full bg-[#FF5F57]" />
            <div className="w-3 h-3 rounded-full bg-[#FFBD2E]" />
            <div className="w-3 h-3 rounded-full bg-[#28C840]" />
          </div>
          {/* URL bar */}
          <div className="flex-1 mx-4 bg-white/5 rounded-md px-3 py-1 text-white/35 font-mono text-xs">
            app.resolvex.io/dashboard
          </div>
        </div>

        {/* App content */}
        <div className="flex min-h-[480px]">
          {/* Sidebar */}
          <aside className="w-56 bg-white/[0.03] border-r border-white/[0.06] p-4 flex-shrink-0">
            {/* Logo */}
            <div className="flex items-center gap-2 mb-8">
              <div className="bg-teal w-7 h-7 rounded-lg flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                R
              </div>
              <span className="text-white font-display text-sm font-semibold">Resolvex</span>
            </div>

            {/* Nav items */}
            <nav className="space-y-1">
              {[
                { label: 'Dashboard', active: true },
                { label: 'Risk Register', active: false },
                { label: 'Audits', active: false },
                { label: 'Actions', active: false },
                { label: 'Documents', active: false },
                { label: 'Reports', active: false },
              ].map((item) => (
                <div
                  key={item.label}
                  className={`px-3 py-2 rounded-lg text-sm font-body cursor-default ${
                    item.active
                      ? 'bg-white/[0.08] text-white'
                      : 'text-white/40 hover:text-white/60 transition-colors'
                  }`}
                >
                  {item.label}
                </div>
              ))}
            </nav>
          </aside>

          {/* Main content */}
          <main className="flex-1 p-6 grid grid-cols-2 gap-4 content-start">
            {/* Card 1: Overall Compliance Score */}
            <div className="bg-white/5 rounded-xl p-5 border border-white/10">
              <p className="text-gray-400 text-xs font-mono uppercase tracking-wider">
                Overall Compliance Score
              </p>
              <p className="font-display text-5xl text-white font-bold mt-2">94.2%</p>
              <p className="text-success-500 text-sm mt-1 font-body">↑ 3.2% vs last quarter</p>
              {/* Mini bar chart */}
              <div className="flex gap-1 items-end h-16 mt-4">
                {barHeights.map((h, i) => (
                  <div
                    key={i}
                    className={`rounded-sm w-6 ${i === barHeights.length - 1 ? 'bg-teal' : 'bg-teal/40'} ${h}`}
                  />
                ))}
              </div>
            </div>

            {/* Card 2: Open Actions */}
            <div className="bg-white/5 rounded-xl p-5 border border-white/10">
              <p className="text-gray-400 text-xs font-mono uppercase tracking-wider">
                Open Actions
              </p>
              <p className="font-display text-5xl text-white font-bold mt-2">23</p>
              <p className="mt-1 font-body text-sm">
                <span className="text-critical">5 new</span>
                <span className="text-gray-500 mx-2">·</span>
                <span className="text-warning-500">3 overdue</span>
              </p>
              {/* Mini bar chart */}
              <div className="flex gap-1 items-end h-16 mt-4">
                {warningBarHeights.map((h, i) => (
                  <div
                    key={i}
                    className={`rounded-sm w-6 ${i === warningBarHeights.length - 1 ? 'bg-warning-500' : 'bg-warning-500/50'} ${h}`}
                  />
                ))}
              </div>
            </div>

            {/* Card 3: Standards Coverage */}
            <div className="bg-white/5 rounded-xl p-5 border border-white/10">
              <p className="text-gray-400 text-xs font-mono uppercase tracking-wider">
                Standards Coverage
              </p>
              <div className="flex items-center gap-6 mt-3">
                {/* SVG donut */}
                <svg width="120" height="120" viewBox="0 0 120 120" className="flex-shrink-0">
                  {/* Background ring */}
                  <circle
                    cx="60"
                    cy="60"
                    r="48"
                    fill="none"
                    stroke="rgba(255,255,255,0.1)"
                    strokeWidth="12"
                  />
                  {/* Primary arc — 75% (270deg) */}
                  <circle
                    cx="60"
                    cy="60"
                    r="48"
                    fill="none"
                    stroke="#1E3A8A"
                    strokeWidth="12"
                    strokeDasharray={`${2 * Math.PI * 48 * 0.75} ${2 * Math.PI * 48 * 0.25}`}
                    strokeLinecap="round"
                    transform="rotate(-90 60 60)"
                  />
                  {/* Secondary arc — 15% */}
                  <circle
                    cx="60"
                    cy="60"
                    r="48"
                    fill="none"
                    stroke="#059669"
                    strokeWidth="12"
                    strokeDasharray={`${2 * Math.PI * 48 * 0.15} ${2 * Math.PI * 48 * 0.85}`}
                    strokeLinecap="round"
                    transform={`rotate(${-90 + 360 * 0.75} 60 60)`}
                  />
                  {/* Center text */}
                  <text
                    x="60"
                    y="55"
                    textAnchor="middle"
                    fill="white"
                    fontSize="16"
                    fontWeight="700"
                    fontFamily="inherit"
                  >
                    29/29
                  </text>
                  <text
                    x="60"
                    y="72"
                    textAnchor="middle"
                    fill="rgba(255,255,255,0.4)"
                    fontSize="9"
                    fontFamily="inherit"
                  >
                    standards
                  </text>
                </svg>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-sm bg-brand-700 flex-shrink-0" />
                    <span className="text-gray-400 text-xs font-body">Active (75%)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-sm bg-teal flex-shrink-0" />
                    <span className="text-gray-400 text-xs font-body">In Progress (15%)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-sm bg-white/10 flex-shrink-0" />
                    <span className="text-gray-400 text-xs font-body">Planned (10%)</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Card 4: Recent Activity */}
            <div className="bg-white/5 rounded-xl p-5 border border-white/10">
              <p className="text-gray-400 text-xs font-mono uppercase tracking-wider">
                Recent Activity
              </p>
              <div className="mt-4 space-y-3">
                {/* Activity 1 */}
                <div className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-full bg-success-500/15 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <div className="w-2 h-2 rounded-full bg-success-500" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-white text-xs font-body">ISO 9001 audit completed</p>
                    <p className="text-gray-500 text-xs font-mono mt-0.5">2 hours ago</p>
                  </div>
                </div>
                {/* Activity 2 */}
                <div className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-full bg-critical/15 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <div className="w-2 h-2 rounded-full bg-critical" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-white text-xs font-body">3 risks escalated to HIGH</p>
                    <p className="text-gray-500 text-xs font-mono mt-0.5">4 hours ago</p>
                  </div>
                </div>
                {/* Activity 3 */}
                <div className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-full bg-warning-500/15 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <div className="w-2 h-2 rounded-full bg-warning-500" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-white text-xs font-body">Document approved</p>
                    <p className="text-gray-500 text-xs font-mono mt-0.5">Yesterday</p>
                  </div>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </section>
  );
}
