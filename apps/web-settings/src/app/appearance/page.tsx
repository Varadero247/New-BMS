'use client';

import { useState, useEffect } from 'react';

const themes = [
  { id: 'light', label: 'Light', icon: '☀️' },
  { id: 'dark', label: 'Dark', icon: '🌙' },
  { id: 'system', label: 'System', icon: '💻' },
] as const;

const accentColors = [
  { id: 'blue', label: 'Blue', color: '#1E3A8A' },
  { id: 'indigo', label: 'Indigo', color: '#4F46E5' },
  { id: 'purple', label: 'Purple', color: '#7C3AED' },
  { id: 'green', label: 'Green', color: '#059669' },
  { id: 'red', label: 'Red', color: '#DC2626' },
  { id: 'orange', label: 'Orange', color: '#EA580C' },
];

const densityOptions = [
  { id: 'compact', label: 'Compact', description: 'Reduced spacing, smaller text' },
  { id: 'comfortable', label: 'Comfortable', description: 'Default spacing and sizing' },
  { id: 'spacious', label: 'Spacious', description: 'More whitespace, larger targets' },
];

export default function AppearancePage() {
  const [theme, setTheme] = useState<string>('light');
  const [accentColor, setAccentColor] = useState('blue');
  const [density, setDensity] = useState('comfortable');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [animationsEnabled, setAnimationsEnabled] = useState(true);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('ims-theme');
    if (stored) setTheme(stored);
    const storedAccent = localStorage.getItem('ims-accent');
    if (storedAccent) setAccentColor(storedAccent);
  }, []);

  const handleThemeChange = (t: string) => {
    setTheme(t);
    if (t === 'dark') {
      document.documentElement.classList.add('dark');
    } else if (t === 'light') {
      document.documentElement.classList.remove('dark');
    } else {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      document.documentElement.classList.toggle('dark', prefersDark);
    }
    localStorage.setItem('ims-theme', t);
  };

  const handleSave = () => {
    localStorage.setItem('ims-accent', accentColor);
    localStorage.setItem('ims-density', density);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="p-6 space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Appearance</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Customize the look and feel of your workspace</p>
      </div>

      {/* Theme */}
      <div className="bg-white dark:bg-gray-900 rounded-lg border p-4 space-y-4">
        <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Theme</h2>
        <div className="grid grid-cols-3 gap-3">
          {themes.map(t => (
            <button
              key={t.id}
              onClick={() => handleThemeChange(t.id)}
              className={`flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-colors ${
                theme === t.id
                  ? 'border-blue-600 bg-blue-50'
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
              }`}
            >
              <span className="text-2xl">{t.icon}</span>
              <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{t.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Accent Colour */}
      <div className="bg-white dark:bg-gray-900 rounded-lg border p-4 space-y-4">
        <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Accent Colour</h2>
        <p className="text-xs text-gray-500 dark:text-gray-400">Used for buttons, links, and active states</p>
        <div className="flex gap-3">
          {accentColors.map(c => (
            <button
              key={c.id}
              onClick={() => setAccentColor(c.id)}
              className={`group flex flex-col items-center gap-1.5`}
              title={c.label}
            >
              <div
                className={`h-10 w-10 rounded-full border-2 transition-all ${
                  accentColor === c.id ? 'border-gray-900 scale-110 shadow-md' : 'border-transparent hover:scale-105'
                }`}
                style={{ backgroundColor: c.color }}
              />
              <span className="text-[10px] text-gray-500 dark:text-gray-400 font-medium">{c.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Density */}
      <div className="bg-white dark:bg-gray-900 rounded-lg border p-4 space-y-4">
        <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Density</h2>
        <div className="space-y-2">
          {densityOptions.map(opt => (
            <label key={opt.id} className="flex items-start gap-3 p-3 rounded-md hover:bg-gray-50 dark:bg-gray-800 cursor-pointer">
              <input
                type="radio"
                name="density"
                value={opt.id}
                checked={density === opt.id}
                onChange={e => setDensity(e.target.value)}
                className="mt-0.5 h-4 w-4 text-blue-600"
              />
              <div>
                <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{opt.label}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">{opt.description}</div>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Other preferences */}
      <div className="bg-white dark:bg-gray-900 rounded-lg border p-4 space-y-4">
        <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Other Preferences</h2>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-gray-900 dark:text-gray-100">Collapse sidebar by default</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">Start with sidebar minimized on each page load</div>
            </div>
            <button
              type="button"
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors ${
                sidebarCollapsed ? 'bg-blue-600' : 'bg-gray-200'
              }`}
            >
              <span className={`pointer-events-none inline-block h-4 w-4 rounded-full bg-white dark:bg-gray-900 shadow transform transition-transform ${
                sidebarCollapsed ? 'translate-x-4' : 'translate-x-0'
              }`} />
            </button>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-gray-900 dark:text-gray-100">Animations</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">Enable transitions and motion effects</div>
            </div>
            <button
              type="button"
              onClick={() => setAnimationsEnabled(!animationsEnabled)}
              className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors ${
                animationsEnabled ? 'bg-blue-600' : 'bg-gray-200'
              }`}
            >
              <span className={`pointer-events-none inline-block h-4 w-4 rounded-full bg-white dark:bg-gray-900 shadow transform transition-transform ${
                animationsEnabled ? 'translate-x-4' : 'translate-x-0'
              }`} />
            </button>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          onClick={handleSave}
          className="px-6 py-2 text-sm font-medium rounded-md bg-blue-600 text-white hover:bg-blue-700"
        >
          {saved ? 'Saved!' : 'Save Preferences'}
        </button>
      </div>
    </div>
  );
}
