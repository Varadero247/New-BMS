'use client';

interface Testimonial {
  quote: string;
  name: string;
  role: string;
  avatarFrom: string;
  avatarTo: string;
}

const testimonials: Testimonial[] = [
  {
    quote:
      'Nexara replaced four separate tools and gave us a single source of truth for all 12 of our ISO certifications.',
    name: 'Michael Torres',
    role: 'Head of Compliance, Meridian Aerospace',
    avatarFrom: 'from-navy',
    avatarTo: 'to-teal',
  },
  {
    quote:
      'The AI assistant alone saved our team 20 hours per week on document reviews and gap analysis.',
    name: 'Dr. Priya Sharma',
    role: 'QHSE Director, BioNova Pharma',
    avatarFrom: 'from-sage',
    avatarTo: 'to-info-500',
  },
  {
    quote:
      'Implementation took 3 weeks, not 3 months. The unified dashboard changed how our board sees compliance.',
    name: 'Lars Eriksson',
    role: 'CEO, NordIC Manufacturing',
    avatarFrom: 'from-warning-500',
    avatarTo: 'to-warning-600',
  },
];

function StarRating() {
  return (
    <div className="flex gap-1 mt-4" aria-label="5 out of 5 stars">
      {Array.from({ length: 5 }).map((_, i) => (
        <svg
          key={i}
          className="w-4 h-4 text-warning-500"
          viewBox="0 0 20 20"
          fill="currentColor"
          aria-hidden="true"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

export default function Testimonials() {
  return (
    <section className="py-24 max-w-7xl mx-auto px-6">
      {/* Section header */}
      <div className="text-center">
        <h2 className="font-display text-4xl font-bold text-white">
          Trusted by compliance leaders
        </h2>
        <p className="text-gray-400 mt-4 max-w-xl mx-auto font-body">
          From aerospace to pharma, compliance teams worldwide rely on Nexara to stay audit-ready
          every day.
        </p>
      </div>

      {/* Cards grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
        {testimonials.map((t) => (
          <div
            key={t.name}
            className="bg-surface-dark-alt rounded-2xl p-8 border border-white/10 hover:border-teal hover:-translate-y-1 transition-all duration-300 group flex flex-col"
          >
            {/* Opening quote mark */}
            <div
              className="font-display text-6xl text-teal/40 leading-none select-none"
              aria-hidden="true"
            >
              &ldquo;
            </div>

            {/* Quote */}
            <blockquote className="font-display italic text-white/70 mt-4 text-lg leading-relaxed flex-1">
              {t.quote}
            </blockquote>

            {/* Author */}
            <div className="mt-6 flex items-center gap-4">
              <div
                className={`w-12 h-12 rounded-full bg-gradient-to-br ${t.avatarFrom} ${t.avatarTo} flex-shrink-0`}
                aria-hidden="true"
              />
              <div>
                <p className="text-white text-sm font-medium font-body">{t.name}</p>
                <p className="text-gray-500 text-sm font-body">{t.role}</p>
              </div>
            </div>

            {/* Star rating */}
            <StarRating />
          </div>
        ))}
      </div>
    </section>
  );
}
