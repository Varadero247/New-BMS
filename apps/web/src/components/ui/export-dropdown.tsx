'use client';

import { useState, useRef, useEffect } from 'react';
import { Download, FileText, FileSpreadsheet, ChevronDown, Loader2 } from 'lucide-react';

interface ExportDropdownProps {
  onExportPDF: () => void | Promise<void>;
  onExportExcel: () => void | Promise<void>;
  disabled?: boolean;
  className?: string;
}

export function ExportDropdown({
  onExportPDF,
  onExportExcel,
  disabled = false,
  className = '',
}: ExportDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState<'pdf' | 'excel' | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleExport = async (type: 'pdf' | 'excel') => {
    setLoading(type);
    try {
      if (type === 'pdf') {
        await onExportPDF();
      } else {
        await onExportExcel();
      }
    } finally {
      setLoading(null);
      setIsOpen(false);
    }
  };

  return (
    <div ref={dropdownRef} className={`relative inline-block ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={disabled || loading !== null}
        className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Download className="w-4 h-4" />
        )}
        Export
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-lg bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
          <div className="py-1">
            <button
              onClick={() => handleExport('pdf')}
              disabled={loading !== null}
              className="flex w-full items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 disabled:opacity-50"
            >
              {loading === 'pdf' ? (
                <Loader2 className="w-4 h-4 animate-spin text-red-500" />
              ) : (
                <FileText className="w-4 h-4 text-red-500" />
              )}
              Export as PDF
            </button>
            <button
              onClick={() => handleExport('excel')}
              disabled={loading !== null}
              className="flex w-full items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 disabled:opacity-50"
            >
              {loading === 'excel' ? (
                <Loader2 className="w-4 h-4 animate-spin text-green-500" />
              ) : (
                <FileSpreadsheet className="w-4 h-4 text-green-500" />
              )}
              Export as Excel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
