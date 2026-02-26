// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// Proprietary and confidential. Unauthorised copying prohibited.
// See LICENCE file for details.

export interface TrieNode {
  children: Map<string, TrieNode>;
  isEnd: boolean;
}

export class Trie {
  private root: TrieNode = { children: new Map(), isEnd: false };
  private _size = 0;

  get size(): number { return this._size; }

  insert(word: string): void {
    let node = this.root;
    for (const ch of word) {
      if (!node.children.has(ch))
        node.children.set(ch, { children: new Map(), isEnd: false });
      node = node.children.get(ch)!;
    }
    if (!node.isEnd) { node.isEnd = true; this._size++; }
  }

  search(word: string): boolean {
    let node = this.root;
    for (const ch of word) {
      if (!node.children.has(ch)) return false;
      node = node.children.get(ch)!;
    }
    return node.isEnd;
  }

  startsWith(prefix: string): boolean {
    let node = this.root;
    for (const ch of prefix) {
      if (!node.children.has(ch)) return false;
      node = node.children.get(ch)!;
    }
    return true;
  }

  delete(word: string): boolean {
    return this._delete(this.root, word, 0);
  }

  private _delete(node: TrieNode, word: string, depth: number): boolean {
    if (depth === word.length) {
      if (!node.isEnd) return false;
      node.isEnd = false; this._size--; return true;
    }
    const ch = word[depth];
    const child = node.children.get(ch);
    if (!child) return false;
    const deleted = this._delete(child, word, depth + 1);
    if (deleted && !child.isEnd && child.children.size === 0)
      node.children.delete(ch);
    return deleted;
  }

  getAllWords(): string[] {
    const result: string[] = [];
    this._collect(this.root, "", result);
    return result.sort();
  }

  words(): string[] { return this.getAllWords(); }

  private _collect(node: TrieNode, prefix: string, result: string[]): void {
    if (node.isEnd) result.push(prefix);
    for (const [ch, child] of node.children)
      this._collect(child, prefix + ch, result);
  }

  getWordsWithPrefix(prefix: string): string[] {
    let node = this.root;
    for (const ch of prefix) {
      if (!node.children.has(ch)) return [];
      node = node.children.get(ch)!;
    }
    const result: string[] = [];
    this._collect(node, prefix, result);
    return result.sort();
  }

  wordsWithPrefix(prefix: string): string[] { return this.getWordsWithPrefix(prefix); }

  countWithPrefix(prefix: string): number {
    return this.getWordsWithPrefix(prefix).length;
  }

  longestCommonPrefix(): string {
    let node = this.root; let prefix = "";
    while (node.children.size === 1 && !node.isEnd) {
      const [ch, child] = Array.from(node.children.entries())[0];
      prefix += ch; node = child;
    }
    return prefix;
  }

  clear(): void {
    this.root = { children: new Map(), isEnd: false };
    this._size = 0;
  }
}

export function buildTrie(words: string[]): Trie {
  const t = new Trie();
  for (const w of words) t.insert(w);
  return t;
}

// CompressedTrie (Radix / Patricia Tree)
interface RNode{label:string;children:Map<string,RNode>;isEnd:boolean;}
function mkR(l=""):RNode{return{label:l,children:new Map(),isEnd:false};}
function cpL(a:string,b:string):number{
  let i=0;while(i<a.length&&i<b.length&&a[i]===b[i])i++;return i;
}
export class CompressedTrie{
  private root:RNode=mkR();private _size=0;
  get size():number{return this._size;}
  insert(w:string):void{this._i(this.root,w);}
  private _i(n:RNode,w:string):void{
    if(w===""){if(!n.isEnd){n.isEnd=true;this._size++;}return;}
    const fc=w[0];
    if(!n.children.has(fc)){const c=mkR(w);c.isEnd=true;n.children.set(fc,c);this._size++;return;}
    const ch=n.children.get(fc)!;const cp=cpL(ch.label,w);
    if(cp===ch.label.length){this._i(ch,w.slice(cp));return;}
    const ex=mkR(ch.label.slice(cp));ex.children=ch.children;ex.isEnd=ch.isEnd;
    ch.label=ch.label.slice(0,cp);ch.children=new Map();ch.isEnd=false;
    ch.children.set(ex.label[0],ex);
    const r=w.slice(cp);
    if(r===""){ch.isEnd=true;this._size++;}
    else{const nn=mkR(r);nn.isEnd=true;ch.children.set(r[0],nn);this._size++;}
  }
  search(w:string):boolean{return this._s(this.root,w);}
  private _s(n:RNode,w:string):boolean{
    if(w==="")return n.isEnd;
    const ch=n.children.get(w[0]);if(!ch||!w.startsWith(ch.label))return false;
    return this._s(ch,w.slice(ch.label.length));
  }
  startsWith(p:string):boolean{return this._sw(this.root,p);}
  private _sw(n:RNode,p:string):boolean{
    if(p==="")return true;const ch=n.children.get(p[0]);if(!ch)return false;
    const cp=cpL(ch.label,p);if(cp===p.length)return true;if(cp<ch.label.length)return false;
    return this._sw(ch,p.slice(cp));
  }
  delete(w:string):boolean{const f={d:false};this._d(this.root,w,f);return f.d;}
  private _d(n:RNode,w:string,f:{d:boolean}):void{
    if(w===""){if(!n.isEnd)return;n.isEnd=false;this._size--;f.d=true;return;}
    const fc=w[0];const ch=n.children.get(fc);if(!ch||!w.startsWith(ch.label))return;
    this._d(ch,w.slice(ch.label.length),f);
    if(f.d&&!ch.isEnd&&ch.children.size===0){n.children.delete(fc);}
    else if(f.d&&!ch.isEnd&&ch.children.size===1){
      const gc=Array.from(ch.children.values())[0];
      ch.label=ch.label+gc.label;ch.children=gc.children;ch.isEnd=gc.isEnd;
    }
  }
  words():string[]{const r:string[]=[];this._c(this.root,"",r);return r.sort();}
  private _c(n:RNode,p:string,r:string[]):void{
    if(n.isEnd)r.push(p);
    for(const c of n.children.values())this._c(c,p+c.label,r);
  }
}

// TernarySearchTree (TST)
interface TN<T>{char:string;left:TN<T>|null;mid:TN<T>|null;right:TN<T>|null;value:T|undefined;hasValue:boolean;}
function mkTN<T>(c:string):TN<T>{return{char:c,left:null,mid:null,right:null,value:undefined,hasValue:false};}
export class TernarySearchTree<T>{
  private root:TN<T>|null=null;private _size=0;
  get size():number{return this._size;}
  insert(k:string,v:T):void{if(!k)return;this.root=this._i(this.root,k,0,v);}
  private _i(n:TN<T>|null,k:string,d:number,v:T):TN<T>{
    const c=k[d];if(!n)n=mkTN<T>(c);
    if(c<n.char)n.left=this._i(n.left,k,d,v);
    else if(c>n.char)n.right=this._i(n.right,k,d,v);
    else if(d<k.length-1)n.mid=this._i(n.mid,k,d+1,v);
    else{if(!n.hasValue)this._size++;n.value=v;n.hasValue=true;}
    return n;
  }
  get(k:string):T|undefined{if(!k)return undefined;return this._g(this.root,k,0)?.value;}
  private _g(n:TN<T>|null,k:string,d:number):TN<T>|null{
    if(!n)return null;const c=k[d];
    if(c<n.char)return this._g(n.left,k,d);
    if(c>n.char)return this._g(n.right,k,d);
    if(d===k.length-1)return n.hasValue?n:null;
    return this._g(n.mid,k,d+1);
  }
  has(k:string):boolean{return this.get(k)!==undefined;}
  delete(k:string):boolean{
    const r=this._del(this.root,k,0);
    if(r.deleted){this.root=r.node;this._size--;return true;}return false;
  }
  private _del(n:TN<T>|null,k:string,d:number):{node:TN<T>|null;deleted:boolean}{
    if(!n)return{node:null,deleted:false};const c=k[d];
    if(c<n.char){const r=this._del(n.left,k,d);n.left=r.node;return{node:n,deleted:r.deleted};}
    if(c>n.char){const r=this._del(n.right,k,d);n.right=r.node;return{node:n,deleted:r.deleted};}
    if(d===k.length-1){
      if(!n.hasValue)return{node:n,deleted:false};
      n.hasValue=false;n.value=undefined;return{node:n,deleted:true};
    }
    const r=this._del(n.mid,k,d+1);n.mid=r.node;return{node:n,deleted:r.deleted};
  }
  keysWithPrefix(p:string):string[]{
    const res:string[]=[];
    if(!p){this._ca(this.root,'',res);return res.sort();}
    let n=this.root;let d=0;
    while(n&&d<p.length){const c=p[d];
      if(c<n.char){n=n.left;}
      else if(c>n.char){n=n.right;}
      else{
        if(d===p.length-1){if(n.hasValue)res.push(p);this._ca(n.mid,p,res);return res.sort();}
        n=n.mid;d++;
      }
    }
    return res.sort();
  }
  private _ca(n:TN<T>|null,p:string,r:string[]):void{
    if(!n)return;
    this._ca(n.left,p,r);
    if(n.hasValue)r.push(p+n.char);
    this._ca(n.mid,p+n.char,r);
    this._ca(n.right,p,r);
  }
}
