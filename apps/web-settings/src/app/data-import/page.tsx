'use client';

import { BulkImportWizard } from '@ims/ui';

export default function DataImportPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Data Import</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Bulk import records from CSV files into any module.
        </p>
      </div>

      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-6">
        <BulkImportWizard
          apiBaseUrl="http://localhost:4000"
          onComplete={(result) => {
            console.log('Import complete:', result);
          }}
        />
      </div>

      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <h3 className="text-sm font-medium text-blue-800 dark:text-blue-300">
          Tips for successful imports
        </h3>
        <ul className="mt-2 space-y-1 text-sm text-blue-700 dark:text-blue-400">
          <li>- Download the template for your record type to see required headers</li>
          <li>- Dates should be in ISO format (YYYY-MM-DD)</li>
          <li>- Enum values must match exactly (e.g., OPEN, CLOSED, CRITICAL)</li>
          <li>- Email fields must be valid email addresses</li>
          <li>- Numeric fields must contain only numbers</li>
        </ul>
      </div>
    </div>
  );
}
