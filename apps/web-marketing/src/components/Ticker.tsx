const TICKER_ITEMS = [
  'ISO 9001',
  'ISO 14001',
  'ISO 45001',
  'ISO 27001',
  'ISO 22001',
  'ISO 37001',
  'ISO 42001',
  'ESG Reporting',
  'GDPR Compliance',
];

function TickerList() {
  return (
    <>
      {TICKER_ITEMS.map((item, i) => (
        <span key={i} className="inline-flex items-center">
          <span className="font-mono text-sm text-white/60 whitespace-nowrap">{item}</span>
          <span className="text-teal mx-6 select-none" aria-hidden="true">
            •
          </span>
        </span>
      ))}
    </>
  );
}

export default function Ticker() {
  return (
    <div className="bg-navy py-3 overflow-hidden" aria-label="Standards marquee" aria-hidden="true">
      <div className="flex whitespace-nowrap" style={{ animation: 'ticker 28s linear infinite' }}>
        {/* Duplicate for seamless loop */}
        <TickerList />
        <TickerList />
        <TickerList />
      </div>
      <style>{`
        @keyframes ticker {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-33.333%); }
        }
        @media (prefers-reduced-motion: reduce) {
          .flex[style*='ticker'] { animation: none; }
        }
      `}</style>
    </div>
  );
}
