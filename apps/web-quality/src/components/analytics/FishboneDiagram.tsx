'use client';

import { useMemo } from 'react';

interface Cause {
  id: string;
  text: string;
  subCauses?: string[];
}

interface Category {
  name: string;
  causes: Cause[];
  color?: string;
}

interface FishboneDiagramProps {
  effect: string;
  categories: Category[];
  title?: string;
}

const defaultColors = [
  '#1E3A8A', // navy
  '#10B981', // success
  '#F59E0B', // warning
  '#DC2626', // critical
  '#8B5CF6', // violet
  '#EC4899', // pink
];

const defaultCategories = [
  'Manpower',
  'Methods',
  'Materials',
  'Machines',
  'Measurement',
  'Environment',
];

export function FishboneDiagram({
  effect,
  categories,
  title = 'Cause and Effect Analysis (Ishikawa)',
}: FishboneDiagramProps) {
  const categoriesWithColors = useMemo(
    () =>
      categories.map((cat, i) => ({
        ...cat,
        color: cat.color || defaultColors[i % defaultColors.length],
      })),
    [categories]
  );

  const topCategories = categoriesWithColors.filter((_, i) => i % 2 === 0);
  const bottomCategories = categoriesWithColors.filter((_, i) => i % 2 === 1);

  return (
    <div className="w-full p-4">
      {title && (
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 text-center">
          {title}
        </h3>
      )}

      <div className="relative min-h-[400px]">
        {/* Main spine */}
        <div className="absolute left-0 right-20 top-1/2 h-1 bg-gray-800 transform -translate-y-1/2" />

        {/* Effect (fish head) */}
        <div className="absolute right-0 top-1/2 transform -translate-y-1/2">
          <div className="relative">
            {/* Arrow head shape */}
            <div
              className="w-0 h-0
              border-t-[40px] border-t-transparent
              border-b-[40px] border-b-transparent
              border-l-[30px] border-l-gray-800
              absolute -left-0 top-1/2 transform -translate-y-1/2"
            />
            <div className="bg-red-500 text-white px-4 py-3 rounded-lg shadow-lg ml-6 max-w-[200px]">
              <p className="font-semibold text-center text-sm">{effect}</p>
            </div>
          </div>
        </div>

        {/* Top categories */}
        <div className="absolute top-0 left-0 right-24 flex justify-around">
          {topCategories.map((category, index) => (
            <CategoryBranch
              key={category.name}
              category={category}
              position="top"
              offset={index * 15}
            />
          ))}
        </div>

        {/* Bottom categories */}
        <div className="absolute bottom-0 left-0 right-24 flex justify-around">
          {bottomCategories.map((category, index) => (
            <CategoryBranch
              key={category.name}
              category={category}
              position="bottom"
              offset={index * 15}
            />
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="mt-8 flex flex-wrap gap-4 justify-center">
        {categoriesWithColors.map((cat) => (
          <div key={cat.name} className="flex items-center gap-2">
            <div className="w-4 h-4 rounded" style={{ backgroundColor: cat.color }} />
            <span className="text-sm text-gray-600">{cat.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

interface CategoryBranchProps {
  category: Category & { color: string };
  position: 'top' | 'bottom';
  offset: number;
}

function CategoryBranch({ category, position, offset }: CategoryBranchProps) {
  const isTop = position === 'top';

  return (
    <div
      className={`relative flex flex-col items-center ${isTop ? 'pb-4' : 'pt-4'}`}
      style={{ marginLeft: `${offset}px` }}
    >
      {/* Category label */}
      <div
        className={`px-3 py-2 rounded-lg text-white font-semibold text-sm shadow-md ${
          isTop ? 'order-1' : 'order-3'
        }`}
        style={{ backgroundColor: category.color }}
      >
        {category.name}
      </div>

      {/* Branch line */}
      <div className={`w-0.5 h-24 order-2`} style={{ backgroundColor: category.color }} />

      {/* Causes */}
      <div className={`absolute ${isTop ? 'top-12' : 'bottom-12'} left-0 right-0`}>
        {category.causes.map((cause, i) => (
          <div
            key={cause.id}
            className={`relative ${isTop ? 'mb-1' : 'mt-1'}`}
            style={{
              marginLeft: `${i * 8}px`,
              transform: isTop ? 'translateY(0)' : 'translateY(0)',
            }}
          >
            {/* Cause line (small bone) */}
            <div
              className="absolute h-0.5 w-8"
              style={{
                backgroundColor: category.color,
                top: '50%',
                left: '-32px',
                transform: `rotate(${isTop ? '45' : '-45'}deg)`,
              }}
            />

            {/* Cause text */}
            <div
              className="text-xs px-2 py-1 rounded bg-gray-100 dark:bg-gray-800 border whitespace-nowrap max-w-[120px] truncate"
              style={{ borderColor: category.color }}
              title={cause.text}
            >
              {cause.text}
            </div>

            {/* Sub-causes */}
            {cause.subCauses && cause.subCauses.length > 0 && (
              <div className={`ml-4 ${isTop ? 'mt-1' : 'mb-1'}`}>
                {cause.subCauses.map((sub, j) => (
                  <div
                    key={j}
                    className="text-xs text-gray-500 dark:text-gray-400 pl-2 border-l border-gray-300"
                  >
                    {sub}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// Helper to create empty fishbone with standard 6M categories
export function createEmpty6MFishbone(): Category[] {
  return defaultCategories.map((name, i) => ({
    name,
    causes: [],
    color: defaultColors[i],
  }));
}
