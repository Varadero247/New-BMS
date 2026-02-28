export type ArticleStatus = 'DRAFT' | 'REVIEW' | 'PUBLISHED' | 'ARCHIVED' | 'DEPRECATED';
export type ArticleCategory = 'PROCEDURE' | 'POLICY' | 'GUIDE' | 'FAQ' | 'REFERENCE' | 'TEMPLATE';
export type ContentType = 'TEXT' | 'MARKDOWN' | 'HTML';

export interface KBArticle {
  id: string;
  title: string;
  content: string;
  contentType: ContentType;
  category: ArticleCategory;
  status: ArticleStatus;
  tags: string[];
  author: string;
  version: number;
  createdAt: Date;
  updatedAt: Date;
  publishedAt?: Date;
  viewCount: number;
  helpful: number;
  notHelpful: number;
}

export interface KBCategory {
  id: string;
  name: string;
  description: string;
  parentId?: string;
  articleCount: number;
}
