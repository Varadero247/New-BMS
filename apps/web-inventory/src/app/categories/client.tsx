'use client';

import { useState } from 'react';
import { FolderOpen, ChevronDown, ChevronRight, Package, Search, Tags, BarChart3 } from 'lucide-react';

interface Category {
  id: string;
  name: string;
  code: string;
  description: string;
  parentId: string | null;
  itemCount: number;
  totalValue: number;
  children: Category[];
  status: 'active' | 'inactive';
}

const categories: Category[] = [
  {
    id: 'cat-1', name: 'Raw Materials', code: 'RM', description: 'Base materials used in production', parentId: null, itemCount: 342, totalValue: 1250000, status: 'active',
    children: [
      { id: 'cat-1a', name: 'Metals', code: 'RM-MET', description: 'Ferrous and non-ferrous metals', parentId: 'cat-1', itemCount: 128, totalValue: 680000, status: 'active', children: [
        { id: 'cat-1a1', name: 'Steel', code: 'RM-MET-STL', description: 'Carbon, stainless, and alloy steels', parentId: 'cat-1a', itemCount: 45, totalValue: 320000, status: 'active', children: [] },
        { id: 'cat-1a2', name: 'Aluminium', code: 'RM-MET-ALU', description: 'Aluminium sheets, bars, and billets', parentId: 'cat-1a', itemCount: 38, totalValue: 210000, status: 'active', children: [] },
        { id: 'cat-1a3', name: 'Copper', code: 'RM-MET-COP', description: 'Copper wire, sheet, and tube', parentId: 'cat-1a', itemCount: 25, totalValue: 95000, status: 'active', children: [] },
        { id: 'cat-1a4', name: 'Titanium', code: 'RM-MET-TIT', description: 'Aerospace-grade titanium alloys', parentId: 'cat-1a', itemCount: 20, totalValue: 55000, status: 'active', children: [] },
      ]},
      { id: 'cat-1b', name: 'Polymers', code: 'RM-POL', description: 'Plastics, rubbers, and composites', parentId: 'cat-1', itemCount: 89, totalValue: 245000, status: 'active', children: [] },
      { id: 'cat-1c', name: 'Chemicals', code: 'RM-CHM', description: 'Process chemicals and reagents', parentId: 'cat-1', itemCount: 67, totalValue: 180000, status: 'active', children: [] },
      { id: 'cat-1d', name: 'Timber', code: 'RM-TMB', description: 'Hardwood and softwood lumber', parentId: 'cat-1', itemCount: 58, totalValue: 145000, status: 'active', children: [] },
    ],
  },
  {
    id: 'cat-2', name: 'Components', code: 'CMP', description: 'Sub-assemblies and bought-out parts', parentId: null, itemCount: 567, totalValue: 890000, status: 'active',
    children: [
      { id: 'cat-2a', name: 'Electronics', code: 'CMP-ELC', description: 'PCBs, ICs, connectors, sensors', parentId: 'cat-2', itemCount: 234, totalValue: 450000, status: 'active', children: [] },
      { id: 'cat-2b', name: 'Mechanical', code: 'CMP-MEC', description: 'Bearings, gears, fasteners, seals', parentId: 'cat-2', itemCount: 198, totalValue: 280000, status: 'active', children: [] },
      { id: 'cat-2c', name: 'Hydraulics', code: 'CMP-HYD', description: 'Pumps, valves, hoses, fittings', parentId: 'cat-2', itemCount: 135, totalValue: 160000, status: 'active', children: [] },
    ],
  },
  {
    id: 'cat-3', name: 'Finished Goods', code: 'FG', description: 'Completed products ready for sale', parentId: null, itemCount: 156, totalValue: 3200000, status: 'active',
    children: [
      { id: 'cat-3a', name: 'Standard Products', code: 'FG-STD', description: 'Off-the-shelf standard product range', parentId: 'cat-3', itemCount: 98, totalValue: 1800000, status: 'active', children: [] },
      { id: 'cat-3b', name: 'Custom Products', code: 'FG-CST', description: 'Bespoke customer-specific products', parentId: 'cat-3', itemCount: 58, totalValue: 1400000, status: 'active', children: [] },
    ],
  },
  {
    id: 'cat-4', name: 'Consumables', code: 'CON', description: 'Items consumed during production', parentId: null, itemCount: 234, totalValue: 120000, status: 'active',
    children: [
      { id: 'cat-4a', name: 'Tooling', code: 'CON-TLG', description: 'Cutting tools, jigs, fixtures', parentId: 'cat-4', itemCount: 89, totalValue: 65000, status: 'active', children: [] },
      { id: 'cat-4b', name: 'PPE', code: 'CON-PPE', description: 'Personal protective equipment', parentId: 'cat-4', itemCount: 45, totalValue: 18000, status: 'active', children: [] },
      { id: 'cat-4c', name: 'Packaging', code: 'CON-PKG', description: 'Boxes, pallets, stretch wrap', parentId: 'cat-4', itemCount: 56, totalValue: 22000, status: 'active', children: [] },
      { id: 'cat-4d', name: 'Lubricants', code: 'CON-LUB', description: 'Oils, greases, cutting fluids', parentId: 'cat-4', itemCount: 44, totalValue: 15000, status: 'active', children: [] },
    ],
  },
  {
    id: 'cat-5', name: 'Spare Parts', code: 'SP', description: 'Maintenance and repair spares', parentId: null, itemCount: 412, totalValue: 560000, status: 'active',
    children: [
      { id: 'cat-5a', name: 'Critical Spares', code: 'SP-CRT', description: 'Long-lead, production-critical items', parentId: 'cat-5', itemCount: 78, totalValue: 340000, status: 'active', children: [] },
      { id: 'cat-5b', name: 'General Spares', code: 'SP-GEN', description: 'Common maintenance items', parentId: 'cat-5', itemCount: 334, totalValue: 220000, status: 'active', children: [] },
    ],
  },
  {
    id: 'cat-6', name: 'Legacy Parts', code: 'LEG', description: 'Discontinued product spares (retained for warranty)', parentId: null, itemCount: 89, totalValue: 45000, status: 'inactive',
    children: [],
  },
];

function CategoryNode({ category, depth, searchTerm }: { category: Category; depth: number; searchTerm: string }) {
  const [isExpanded, setIsExpanded] = useState(depth === 0);
  const hasChildren = category.children.length > 0;
  const matchesSearch = !searchTerm || category.name.toLowerCase().includes(searchTerm.toLowerCase()) || category.code.toLowerCase().includes(searchTerm.toLowerCase());

  if (!matchesSearch && !category.children.some(function check(c: Category): boolean { return c.name.toLowerCase().includes(searchTerm.toLowerCase()) || c.code.toLowerCase().includes(searchTerm.toLowerCase()) || c.children.some(check); })) {
    return null;
  }

  return (
    <div>
      <div className={`flex items-center justify-between p-3 rounded-lg hover:bg-sky-50 transition-colors ${depth === 0 ? 'bg-white dark:bg-gray-900 border border-gray-200' : ''}`} style={{ paddingLeft: `${depth * 24 + 12}px` }}>
        <div className="flex items-center gap-2">
          {hasChildren ? (
            <button onClick={() => setIsExpanded(!isExpanded)} className="text-gray-400 dark:text-gray-500 hover:text-gray-600">
              {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            </button>
          ) : (
            <span className="w-4" />
          )}
          {hasChildren ? <FolderOpen className="h-4 w-4 text-sky-500" /> : <Package className="h-4 w-4 text-gray-400 dark:text-gray-500" />}
          <div>
            <div className="flex items-center gap-2">
              <span className="font-medium text-gray-900 dark:text-gray-100 text-sm">{category.name}</span>
              <span className="text-xs font-mono text-sky-600 bg-sky-50 px-1.5 py-0.5 rounded">{category.code}</span>
              {category.status === 'inactive' && <span className="text-xs bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 px-1.5 py-0.5 rounded">Inactive</span>}
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">{category.description}</p>
          </div>
        </div>
        <div className="flex items-center gap-6 text-sm">
          <div className="text-right">
            <p className="font-medium text-gray-900 dark:text-gray-100">{category.itemCount}</p>
            <p className="text-xs text-gray-400 dark:text-gray-500">items</p>
          </div>
          <div className="text-right min-w-[80px]">
            <p className="font-medium text-gray-900 dark:text-gray-100">£{(category.totalValue / 1000).toFixed(0)}k</p>
            <p className="text-xs text-gray-400 dark:text-gray-500">value</p>
          </div>
        </div>
      </div>
      {isExpanded && hasChildren && (
        <div className={depth === 0 ? 'mt-1 space-y-1' : 'space-y-0.5'}>
          {category.children.map((child) => (
            <CategoryNode key={child.id} category={child} depth={depth + 1} searchTerm={searchTerm} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function CategoriesClient() {
  const [searchTerm, setSearchTerm] = useState('');

  const totalItems = categories.reduce((s, c) => s + c.itemCount, 0);
  const totalValue = categories.reduce((s, c) => s + c.totalValue, 0);
  const activeCategories = categories.filter((c) => c.status === 'active').length;
  const totalSubcategories = categories.reduce((s, c) => s + c.children.length + c.children.reduce((ss, cc) => ss + cc.children.length, 0), 0);

  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Inventory Categories</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Hierarchical category structure for inventory classification</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-4">
          <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-medium">Top-Level Categories</p>
          <p className="text-3xl font-bold text-gray-900 dark:text-gray-100 mt-1">{categories.length}</p>
        </div>
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-4">
          <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-medium">Subcategories</p>
          <p className="text-3xl font-bold text-sky-700 mt-1">{totalSubcategories}</p>
        </div>
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-4">
          <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-medium">Total SKUs</p>
          <p className="text-3xl font-bold text-gray-900 dark:text-gray-100 mt-1">{totalItems.toLocaleString()}</p>
        </div>
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-4">
          <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-medium">Total Value</p>
          <p className="text-3xl font-bold text-green-700 mt-1">£{(totalValue / 1000000).toFixed(1)}M</p>
        </div>
      </div>

      {/* Value Distribution */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-4">
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Value Distribution by Category</h3>
        <div className="w-full h-8 flex rounded-lg overflow-hidden">
          {categories.filter((c) => c.status === 'active').map((c, i) => {
            const pct = (c.totalValue / totalValue) * 100;
            const colors = ['bg-sky-500', 'bg-blue-500', 'bg-indigo-500', 'bg-green-500', 'bg-amber-500'];
            return (
              <div key={c.id} className={`${colors[i % colors.length]} relative group`} style={{ width: `${pct}%` }} title={`${c.name}: £${(c.totalValue / 1000).toFixed(0)}k (${pct.toFixed(1)}%)`}>
                {pct > 10 && <span className="absolute inset-0 flex items-center justify-center text-xs text-white font-medium">{c.name}</span>}
              </div>
            );
          })}
        </div>
        <div className="flex flex-wrap gap-3 mt-2">
          {categories.filter((c) => c.status === 'active').map((c, i) => {
            const colors = ['bg-sky-500', 'bg-blue-500', 'bg-indigo-500', 'bg-green-500', 'bg-amber-500'];
            return (
              <div key={c.id} className="flex items-center gap-1.5 text-xs text-gray-600">
                <div className={`w-2.5 h-2.5 rounded ${colors[i % colors.length]}`} />
                {c.name} (£{(c.totalValue / 1000).toFixed(0)}k)
              </div>
            );
          })}
        </div>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
        <input type="text" aria-label="Search categories..." placeholder="Search categories..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-500" />
      </div>

      <div className="space-y-2">
        {categories.map((cat) => (
          <CategoryNode key={cat.id} category={cat} depth={0} searchTerm={searchTerm} />
        ))}
      </div>
    </div>
  );
}
