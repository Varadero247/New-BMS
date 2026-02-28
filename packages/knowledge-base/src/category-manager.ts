import { KBCategory } from './types';

let _catSeq = 0;

export class CategoryManager {
  private readonly categories = new Map<string, KBCategory>();

  create(name: string, description: string, parentId?: string): KBCategory {
    const id = `cat-${++_catSeq}`;
    const cat: KBCategory = { id, name, description, parentId, articleCount: 0 };
    this.categories.set(id, cat);
    return cat;
  }

  incrementCount(id: string): void {
    const c = this.categories.get(id);
    if (c) this.categories.set(id, { ...c, articleCount: c.articleCount + 1 });
  }

  decrementCount(id: string): void {
    const c = this.categories.get(id);
    if (c && c.articleCount > 0) this.categories.set(id, { ...c, articleCount: c.articleCount - 1 });
  }

  get(id: string): KBCategory | undefined { return this.categories.get(id); }
  getAll(): KBCategory[] { return Array.from(this.categories.values()); }
  getChildren(parentId: string): KBCategory[] { return Array.from(this.categories.values()).filter(c => c.parentId === parentId); }
  getRoots(): KBCategory[] { return Array.from(this.categories.values()).filter(c => !c.parentId); }
  getByName(name: string): KBCategory | undefined { return Array.from(this.categories.values()).find(c => c.name === name); }
  getCount(): number { return this.categories.size; }
  delete(id: string): boolean {
    if (!this.categories.has(id)) return false;
    this.categories.delete(id);
    return true;
  }
}
