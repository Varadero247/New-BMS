import { KBArticle, ArticleStatus, ArticleCategory, ContentType } from './types';

let _seq = 0;

export class ArticleStore {
  private readonly articles = new Map<string, KBArticle>();

  create(title: string, content: string, category: ArticleCategory, author: string, tags: string[] = [], contentType: ContentType = 'MARKDOWN'): KBArticle {
    const id = `kb-${++_seq}`;
    const now = new Date();
    const article: KBArticle = {
      id, title, content, contentType, category, author, tags,
      status: 'DRAFT', version: 1,
      createdAt: now, updatedAt: now,
      viewCount: 0, helpful: 0, notHelpful: 0,
    };
    this.articles.set(id, article);
    return article;
  }

  update(id: string, changes: Partial<Pick<KBArticle, 'title' | 'content' | 'tags' | 'category'>>): KBArticle {
    const a = this.articles.get(id);
    if (!a) throw new Error(`Article not found: ${id}`);
    const updated = { ...a, ...changes, version: a.version + 1, updatedAt: new Date() };
    this.articles.set(id, updated);
    return updated;
  }

  publish(id: string): KBArticle {
    const a = this.articles.get(id);
    if (!a) throw new Error(`Article not found: ${id}`);
    const updated = { ...a, status: 'PUBLISHED' as ArticleStatus, publishedAt: new Date(), updatedAt: new Date() };
    this.articles.set(id, updated);
    return updated;
  }

  archive(id: string): KBArticle {
    const a = this.articles.get(id);
    if (!a) throw new Error(`Article not found: ${id}`);
    const updated = { ...a, status: 'ARCHIVED' as ArticleStatus, updatedAt: new Date() };
    this.articles.set(id, updated);
    return updated;
  }

  submitForReview(id: string): KBArticle {
    const a = this.articles.get(id);
    if (!a) throw new Error(`Article not found: ${id}`);
    const updated = { ...a, status: 'REVIEW' as ArticleStatus, updatedAt: new Date() };
    this.articles.set(id, updated);
    return updated;
  }

  recordView(id: string): void {
    const a = this.articles.get(id);
    if (a) this.articles.set(id, { ...a, viewCount: a.viewCount + 1 });
  }

  recordFeedback(id: string, isHelpful: boolean): void {
    const a = this.articles.get(id);
    if (!a) return;
    if (isHelpful) this.articles.set(id, { ...a, helpful: a.helpful + 1 });
    else this.articles.set(id, { ...a, notHelpful: a.notHelpful + 1 });
  }

  get(id: string): KBArticle | undefined { return this.articles.get(id); }
  getAll(): KBArticle[] { return Array.from(this.articles.values()); }
  getByStatus(status: ArticleStatus): KBArticle[] { return Array.from(this.articles.values()).filter(a => a.status === status); }
  getByCategory(category: ArticleCategory): KBArticle[] { return Array.from(this.articles.values()).filter(a => a.category === category); }
  getByAuthor(author: string): KBArticle[] { return Array.from(this.articles.values()).filter(a => a.author === author); }
  getByTag(tag: string): KBArticle[] { return Array.from(this.articles.values()).filter(a => a.tags.includes(tag)); }
  getPublished(): KBArticle[] { return this.getByStatus('PUBLISHED'); }
  search(query: string): KBArticle[] {
    const q = query.toLowerCase();
    return Array.from(this.articles.values()).filter(a =>
      a.title.toLowerCase().includes(q) || a.content.toLowerCase().includes(q) || a.tags.some(t => t.toLowerCase().includes(q))
    );
  }
  getTopViewed(limit = 10): KBArticle[] {
    return Array.from(this.articles.values()).sort((a, b) => b.viewCount - a.viewCount).slice(0, limit);
  }
  getCount(): number { return this.articles.size; }
}
