'use client';

import { useState } from 'react';
import { ArrowUpRight } from 'lucide-react';

type Category = 'All' | 'Product' | 'Standards' | 'Engineering';

interface Article {
  title: string;
  category: Exclude<Category, 'All'>;
  author: string;
  readTime: string;
  avatarFrom: string;
  avatarTo: string;
  featured?: boolean;
}

const articles: Article[] = [
  {
    title: 'ISO 42001: What the new AI management standard means for your organisation',
    category: 'Standards',
    author: 'Sarah Chen',
    readTime: '8 min read',
    avatarFrom: 'from-navy',
    avatarTo: 'to-teal',
    featured: true,
  },
  {
    title: 'Building a unified risk register across 29 standards',
    category: 'Product',
    author: 'James Miller',
    readTime: '5 min read',
    avatarFrom: 'from-sage',
    avatarTo: 'to-teal',
  },
  {
    title: 'How AI is transforming compliance workflows',
    category: 'Engineering',
    author: 'Aisha Patel',
    readTime: '6 min read',
    avatarFrom: 'from-warning-500',
    avatarTo: 'to-warning-600',
  },
  {
    title: 'ESG reporting in 2026: regulatory landscape update',
    category: 'Standards',
    author: 'David Okafor',
    readTime: '4 min read',
    avatarFrom: 'from-navy',
    avatarTo: 'to-teal',
  },
  {
    title: 'GDPR + ISO 27001: the convergence playbook',
    category: 'Standards',
    author: 'Emma Dubois',
    readTime: '7 min read',
    avatarFrom: 'from-sage',
    avatarTo: 'to-teal',
  },
];

const categoryDotColor: Record<Exclude<Category, 'All'>, string> = {
  Product: 'bg-teal',
  Standards: 'bg-warning-500',
  Engineering: 'bg-info-500',
};

const categoryTextColor: Record<Exclude<Category, 'All'>, string> = {
  Product: 'text-teal',
  Standards: 'text-warning-500',
  Engineering: 'text-info-500',
};

const filters: Category[] = ['All', 'Product', 'Standards', 'Engineering'];

export default function Articles() {
  const [activeFilter, setActiveFilter] = useState<Category>('All');

  const featured = articles[0];
  const rest = articles.slice(1);

  const filteredFeatured =
    activeFilter === 'All' || featured.category === activeFilter ? featured : null;
  const filteredRest =
    activeFilter === 'All' ? rest : rest.filter((a) => a.category === activeFilter);

  return (
    <section className="bg-surface-dark-alt py-24">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <h2 className="font-display text-4xl font-bold text-white">Latest insights</h2>

        {/* Filter buttons */}
        <div className="flex gap-2 mt-6 mb-12 flex-wrap">
          {filters.map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`px-4 py-2 rounded-lg text-sm font-body border transition-all duration-150 ${
                activeFilter === filter
                  ? 'bg-white/[0.08] text-white border-white/30'
                  : 'text-gray-500 border-white/10 hover:border-white/20 hover:text-gray-400'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>

        {/* Bento grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Featured card */}
          {filteredFeatured && (
            <div className="md:col-span-1 md:row-span-2 bg-gray-800/50 rounded-2xl border border-white/10 overflow-hidden group hover:bg-white/[0.06] hover:border-white/15 transition-all duration-300 flex flex-col">
              {/* Image placeholder */}
              <div className="h-64 bg-gradient-to-br from-navy/40 to-sage/20 relative flex-shrink-0">
                {/* Subtle grid pattern */}
                <div
                  className="absolute inset-0 opacity-10"
                  style={{
                    backgroundImage:
                      'repeating-linear-gradient(0deg, rgba(255,255,255,0.1) 0, rgba(255,255,255,0.1) 1px, transparent 1px, transparent 40px), repeating-linear-gradient(90deg, rgba(255,255,255,0.1) 0, rgba(255,255,255,0.1) 1px, transparent 1px, transparent 40px)',
                  }}
                />
                {/* Date badge */}
                <div className="absolute bottom-4 left-4 bg-success-500/15 text-success-500 border border-success-500/20 text-xs font-mono px-3 py-1 rounded-full">
                  FEBRUARY 2026
                </div>
              </div>

              {/* Content */}
              <div className="p-6 flex flex-col flex-1">
                {/* Category */}
                <div className="flex items-center gap-1.5">
                  <span
                    className={`w-1.5 h-1.5 rounded-full inline-block ${categoryDotColor[filteredFeatured.category]}`}
                  />
                  <span
                    className={`text-xs font-mono uppercase tracking-wider ${categoryTextColor[filteredFeatured.category]}`}
                  >
                    {filteredFeatured.category}
                  </span>
                </div>

                {/* Title */}
                <h3 className="font-display text-xl text-white mt-2 leading-snug flex-1">
                  {filteredFeatured.title}
                </h3>

                {/* Author */}
                <div className="mt-4 flex items-center gap-3">
                  <div
                    className={`w-8 h-8 rounded-full bg-gradient-to-br ${filteredFeatured.avatarFrom} ${filteredFeatured.avatarTo} flex-shrink-0`}
                  />
                  <div>
                    <p className="text-sm text-gray-400 font-body">{filteredFeatured.author}</p>
                    <p className="text-xs text-gray-600 font-mono">{filteredFeatured.readTime}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Smaller cards */}
          {filteredRest.map((article) => (
            <div
              key={article.title}
              className="bg-gray-800/50 rounded-2xl border border-white/10 p-6 group hover:bg-white/[0.06] hover:border-white/15 transition-all duration-300 relative"
            >
              {/* Arrow icon */}
              <ArrowUpRight className="absolute top-6 right-6 w-4 h-4 text-gray-600 group-hover:text-teal group-hover:translate-x-1 group-hover:-translate-y-1 transition-all duration-200" />

              {/* Category */}
              <div className="flex items-center gap-1.5">
                <span
                  className={`w-1.5 h-1.5 rounded-full inline-block ${categoryDotColor[article.category]}`}
                />
                <span
                  className={`text-xs font-mono uppercase tracking-wider ${categoryTextColor[article.category]}`}
                >
                  {article.category}
                </span>
              </div>

              {/* Title */}
              <h3 className="font-display text-white mt-2 text-lg leading-snug pr-6">
                {article.title}
              </h3>

              {/* Author */}
              <div className="mt-4 flex items-center gap-3">
                <div
                  className={`w-8 h-8 rounded-full bg-gradient-to-br ${article.avatarFrom} ${article.avatarTo} flex-shrink-0`}
                />
                <div>
                  <p className="text-sm text-gray-400 font-body">{article.author}</p>
                  <p className="text-xs text-gray-600 font-mono">{article.readTime}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
