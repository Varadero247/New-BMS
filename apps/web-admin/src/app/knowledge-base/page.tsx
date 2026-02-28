'use client';

import { useState, useMemo } from 'react';
import { Sidebar } from '@/components/sidebar';
import { BookOpen, Search, ChevronDown, ChevronUp, Clock, Tag, ExternalLink } from 'lucide-react';
import { allKBArticles } from '@ims/knowledge-base';
import type { KBArticle } from '@ims/knowledge-base';

type CategoryFilter = 'ALL' | 'GUIDE' | 'PROCEDURE' | 'REFERENCE' | 'FAQ';

const CATEGORY_LABEL: Record<string, string> = {
  GUIDE: 'Guide',
  PROCEDURE: 'Module Guide',
  REFERENCE: 'Reference',
  FAQ: 'FAQ',
  POLICY: 'Policy',
  TEMPLATE: 'Template',
};

const CATEGORY_BADGE: Record<string, string> = {
  GUIDE: 'bg-blue-900/30 text-blue-400 border border-blue-700/50',
  PROCEDURE: 'bg-purple-900/30 text-purple-400 border border-purple-700/50',
  REFERENCE: 'bg-teal-900/30 text-teal-400 border border-teal-700/50',
  FAQ: 'bg-amber-900/30 text-amber-400 border border-amber-700/50',
  POLICY: 'bg-rose-900/30 text-rose-400 border border-rose-700/50',
  TEMPLATE: 'bg-indigo-900/30 text-indigo-400 border border-indigo-700/50',
};

const TAG_COLORS = [
  'bg-teal-900/30 text-teal-400',
  'bg-indigo-900/30 text-indigo-400',
  'bg-cyan-900/30 text-cyan-400',
  'bg-emerald-900/30 text-emerald-400',
  'bg-violet-900/30 text-violet-400',
  'bg-sky-900/30 text-sky-400',
  'bg-orange-900/30 text-orange-400',
];

function getTagColor(tag: string): string {
  let hash = 0;
  for (let i = 0; i < tag.length; i++) hash = (hash * 31 + tag.charCodeAt(i)) & 0xffff;
  return TAG_COLORS[hash % TAG_COLORS.length];
}

function readTime(content: string): number {
  return Math.max(1, Math.ceil(content.split(/\s+/).length / 200));
}

function excerpt(content: string): string {
  const plain = content
    .replace(/^#+\s.*/gm, '')
    .replace(/\n+/g, ' ')
    .replace(/\*\*/g, '')
    .replace(/`[^`]+`/g, '')
    .trim();
  return plain.length > 140 ? plain.slice(0, 140) + '…' : plain;
}

/** Convert inline KB links like [text](/knowledge-base#KB-XXX) to anchor tags */
function resolveKBLinks(html: string): string {
  return html.replace(
    /\[([^\]]+)\]\(\/knowledge-base#(KB-[A-Z]+-\d+)\)/g,
    '<button class="text-blue-400 hover:text-blue-300 underline underline-offset-2 text-sm" data-kbid="$2">$1</button>'
  );
}

function renderMarkdown(content: string): string {
  let html = content
    // headings
    .replace(/^### (.+)$/gm, '<h3 class="text-white font-semibold text-base mt-5 mb-2">$1</h3>')
    .replace(/^## (.+)$/gm, '<h2 class="text-white font-bold text-lg mt-6 mb-3 pb-2 border-b border-white/10">$1</h2>')
    .replace(/^# (.+)$/gm, '<h1 class="text-white font-bold text-xl mt-2 mb-4">$1</h1>')
    // horizontal rule
    .replace(/^---$/gm, '<hr class="border-white/10 my-4" />')
    // blockquote with bold prefix (> **Foo:** bar)
    .replace(
      /^> \*\*(.+?)\*\*: (.+)$/gm,
      '<blockquote class="border-l-4 border-blue-500 pl-4 my-3 text-gray-300 text-sm"><strong class="text-blue-400">$1:</strong> $2</blockquote>'
    )
    // blockquote plain (> text)
    .replace(/^> (.+)$/gm, '<blockquote class="border-l-4 border-blue-500 pl-4 my-3 text-gray-300 text-sm italic">$1</blockquote>')
    // tables — individual rows (must come before li)
    .replace(/^\| (.+) \|$/gm, (row) => {
      const cells = row.split('|').filter((c) => c.trim() && !c.match(/^[-: ]+$/));
      if (!cells.length) return '';
      return '<tr class="border-b border-white/10">' + cells.map((c) => `<td class="px-3 py-1.5 text-gray-300 text-xs border border-white/10">${c.trim()}</td>`).join('') + '</tr>';
    })
    // table separator rows (| --- | --- |) — remove
    .replace(/^\|[-: |]+\|$/gm, '')
    // wrap consecutive tr's in table
    .replace(/(<tr class[^>]+>[\s\S]*?<\/tr>\n?)+/g, (t) => `<table class="border-collapse my-4 w-full text-left text-xs">${t}</table>`)
    // ordered list items
    .replace(/^\d+\. (.+)$/gm, '<li class="ml-6 list-decimal text-gray-300 text-sm mb-1">$1</li>')
    // unordered list items (leading - or *)
    .replace(/^[-*] (.+)$/gm, '<li class="ml-5 list-disc text-gray-300 text-sm mb-1">$1</li>')
    // wrap consecutive li's
    .replace(/(<li[\s\S]*?<\/li>\n?)+/g, (l) => `<ul class="my-2 space-y-0.5">${l}</ul>`)
    // checkbox items
    .replace(/^- \[ \] (.+)$/gm, '<li class="ml-5 flex items-start gap-2 text-gray-300 text-sm mb-1"><span class="mt-0.5 w-4 h-4 rounded border border-gray-600 flex-shrink-0"></span>$1</li>')
    .replace(/^- \[x\] (.+)$/gm, '<li class="ml-5 flex items-start gap-2 text-green-400 text-sm mb-1"><span class="mt-0.5 w-4 h-4 rounded border border-green-500 bg-green-500/20 flex-shrink-0">✓</span>$1</li>')
    // bold
    .replace(/\*\*(.+?)\*\*/g, '<strong class="text-white font-semibold">$1</strong>')
    // inline code
    .replace(/`([^`]+)`/g, '<code class="bg-[#0B1E38] text-blue-300 px-1.5 py-0.5 rounded text-xs font-mono">$1</code>')
    // code blocks (indented with 2+ spaces)
    .replace(/^ {2,}(.+)$/gm, '<pre class="bg-[#0B1E38] rounded px-3 py-1.5 text-blue-300 text-xs font-mono my-1 overflow-x-auto">$1</pre>');

  // resolve KB links
  html = resolveKBLinks(html);

  // convert remaining lines to paragraphs
  html = html.replace(/^([^<\n].+)$/gm, (line) => {
    if (line.startsWith('<')) return line;
    return `<p class="text-gray-300 text-sm mb-2 leading-relaxed">${line}</p>`;
  });

  return html;
}

interface ArticleCardProps {
  article: KBArticle;
  isExpanded: boolean;
  onToggle: () => void;
  onKBLinkClick: (id: string) => void;
}

function ArticleCard({ article, isExpanded, onToggle, onKBLinkClick }: ArticleCardProps) {
  const mins = readTime(article.content);

  function handleContentClick(e: React.MouseEvent<HTMLDivElement>) {
    const target = e.target as HTMLElement;
    const kbId = target.getAttribute('data-kbid');
    if (kbId) {
      e.stopPropagation();
      onKBLinkClick(kbId);
    }
  }

  return (
    <div
      className={`bg-[#112240] border rounded-xl transition-all ${
        isExpanded ? 'border-blue-500/40' : 'border-white/10 hover:border-white/20'
      }`}
    >
      {/* Card header — always visible */}
      <button onClick={onToggle} className="w-full text-left p-5" aria-expanded={isExpanded}>
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-2">
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  CATEGORY_BADGE[article.category] ?? 'bg-gray-700/40 text-gray-400'
                }`}
              >
                {CATEGORY_LABEL[article.category] ?? article.category}
              </span>
              <span className="text-gray-600 text-xs font-mono">{article.id}</span>
              <span className="flex items-center gap-1 text-gray-500 text-xs">
                <Clock className="w-3 h-3" />
                {mins} min read
              </span>
            </div>
            <h3 className="text-white font-semibold text-sm leading-snug">{article.title}</h3>
            {!isExpanded && (
              <p className="text-gray-400 text-xs mt-1.5 leading-relaxed">{excerpt(article.content)}</p>
            )}
            {article.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-3">
                {article.tags.slice(0, 6).map((tag) => (
                  <span key={tag} className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs ${getTagColor(tag)}`}>
                    <Tag className="w-2.5 h-2.5" />
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
          <div className="flex-shrink-0 mt-1">
            {isExpanded ? (
              <ChevronUp className="w-4 h-4 text-gray-400" />
            ) : (
              <ChevronDown className="w-4 h-4 text-gray-400" />
            )}
          </div>
        </div>
      </button>

      {/* Expanded content */}
      {isExpanded && (
        <div className="border-t border-white/10 px-6 pb-6 pt-4">
          <div
            className="prose-dark"
            onClick={handleContentClick}
            dangerouslySetInnerHTML={{ __html: renderMarkdown(article.content) }}
          />
        </div>
      )}
    </div>
  );
}

const TABS: { key: CategoryFilter; label: string }[] = [
  { key: 'ALL', label: 'All Articles' },
  { key: 'GUIDE', label: 'Guides' },
  { key: 'PROCEDURE', label: 'Module Guides' },
  { key: 'REFERENCE', label: 'Admin Reference' },
  { key: 'FAQ', label: 'FAQ' },
];

export default function KnowledgeBasePage() {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<CategoryFilter>('ALL');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const counts = useMemo(() => ({
    ALL: allKBArticles.length,
    GUIDE: allKBArticles.filter((a) => a.category === 'GUIDE').length,
    PROCEDURE: allKBArticles.filter((a) => a.category === 'PROCEDURE').length,
    REFERENCE: allKBArticles.filter((a) => a.category === 'REFERENCE').length,
    FAQ: allKBArticles.filter((a) => a.category === 'FAQ').length,
  }), []);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return allKBArticles.filter((a) => {
      const matchCategory = category === 'ALL' || a.category === category;
      if (!matchCategory) return false;
      if (!q) return true;
      return (
        a.title.toLowerCase().includes(q) ||
        a.id.toLowerCase().includes(q) ||
        a.tags.some((t) => t.toLowerCase().includes(q)) ||
        a.content.toLowerCase().includes(q)
      );
    });
  }, [search, category]);

  function toggleArticle(id: string) {
    setExpandedId((prev) => (prev === id ? null : id));
    // scroll the newly opened card into view
    if (expandedId !== id) {
      setTimeout(() => {
        document.getElementById(`article-${id}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 50);
    }
  }

  function handleKBLinkClick(id: string) {
    // find and expand the linked article; switch to ALL if needed
    const article = allKBArticles.find((a) => a.id === id);
    if (!article) return;
    if (category !== 'ALL' && article.category !== category) {
      setCategory('ALL');
    }
    setSearch('');
    setTimeout(() => {
      setExpandedId(id);
      document.getElementById(`article-${id}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  }

  return (
    <div className="flex min-h-screen bg-[#0B1E38]">
      <Sidebar />
      <div className="flex-1 p-6 ml-64">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-blue-500/20 rounded-lg flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Knowledge Base</h1>
              <p className="text-gray-400 text-sm">
                {counts.ALL} articles — setup guides, module references, FAQ
              </p>
            </div>
          </div>

          {/* Search */}
          <div className="relative w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Search by title, tag, or content…"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setExpandedId(null); }}
              className="w-full bg-[#112240] border border-white/10 rounded-lg pl-9 pr-4 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50"
            />
          </div>
        </div>

        {/* Category tabs */}
        <div className="flex flex-wrap gap-2 mb-6">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => { setCategory(tab.key); setExpandedId(null); setSearch(''); }}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                category === tab.key
                  ? 'bg-[#1B3A6B] text-white'
                  : 'bg-[#112240] text-gray-400 hover:text-white'
              }`}
            >
              {tab.label}
              <span
                className={`text-xs px-1.5 py-0.5 rounded-full ${
                  category === tab.key ? 'bg-blue-500/30 text-blue-200' : 'bg-white/10 text-gray-400'
                }`}
              >
                {counts[tab.key]}
              </span>
            </button>
          ))}
        </div>

        {/* Results count when searching */}
        {search && (
          <p className="text-gray-400 text-sm mb-4">
            {filtered.length === 0 ? (
              'No articles found. Try a different search term.'
            ) : (
              <>
                {filtered.length} article{filtered.length === 1 ? '' : 's'} matching{' '}
                <span className="text-white">"{search}"</span>
              </>
            )}
          </p>
        )}

        {/* Empty state */}
        {filtered.length === 0 && (
          <div className="text-center text-gray-500 py-20">
            <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-20" />
            <p className="text-sm">No articles found.</p>
            {search && (
              <button
                onClick={() => setSearch('')}
                className="mt-3 text-blue-400 hover:text-blue-300 text-sm underline"
              >
                Clear search
              </button>
            )}
          </div>
        )}

        {/* Article list */}
        <div className="space-y-3">
          {filtered.map((article) => (
            <div key={article.id} id={`article-${article.id}`}>
              <ArticleCard
                article={article}
                isExpanded={expandedId === article.id}
                onToggle={() => toggleArticle(article.id)}
                onKBLinkClick={handleKBLinkClick}
              />
            </div>
          ))}
        </div>

        {/* Footer hint */}
        {filtered.length > 0 && !search && (
          <p className="text-center text-gray-600 text-xs mt-8 pb-4">
            <ExternalLink className="w-3 h-3 inline mr-1" />
            Click any article to expand it. Links within articles navigate to related articles.
          </p>
        )}
      </div>
    </div>
  );
}
