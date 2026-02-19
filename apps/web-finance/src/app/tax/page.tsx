'use client';

import axios from 'axios';
import { useEffect, useState } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Badge,
  Button,
  Modal,
  ModalFooter,
  Input,
  Label,
} from '@ims/ui';
import { Plus, Calculator, FileText } from 'lucide-react';
import { api } from '@/lib/api';

interface TaxRate {
  id: string;
  name: string;
  code: string;
  rate: number;
  type: string;
  isActive: boolean;
  description?: string;
}

interface TaxReturn {
  id: string;
  period: string;
  startDate: string;
  endDate: string;
  taxCollected: number;
  taxPaid: number;
  netTax: number;
  status: string;
  dueDate: string;
  filedDate?: string;
}

const returnStatusColors: Record<string, string> = {
  DRAFT: 'bg-gray-100 dark:bg-gray-800 text-gray-700',
  PREPARED: 'bg-blue-100 text-blue-700',
  FILED: 'bg-green-100 text-green-700',
  PAID: 'bg-emerald-100 text-emerald-700',
  OVERDUE: 'bg-red-100 text-red-700',
};

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(amount);
}

export default function TaxPage() {
  const [taxRates, setTaxRates] = useState<TaxRate[]>([]);
  const [taxReturns, setTaxReturns] = useState<TaxReturn[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [createRateOpen, setCreateRateOpen] = useState(false);
  const [createReturnOpen, setCreateReturnOpen] = useState(false);
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const [rateForm, setRateForm] = useState({
    name: '',
    code: '',
    rate: '',
    type: 'SALES_TAX',
    description: '',
  });

  const [returnForm, setReturnForm] = useState({
    period: '',
    startDate: '',
    endDate: '',
    dueDate: '',
    taxCollected: '',
    taxPaid: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setError(null);
      const [ratesRes, returnsRes] = await Promise.all([
        api.get('/tax/rates').catch(() => ({ data: { data: [] } })),
        api.get('/tax/returns').catch(() => ({ data: { data: [] } })),
      ]);
      setTaxRates(ratesRes.data.data || []);
      setTaxReturns(returnsRes.data.data || []);
    } catch {
      setError('Failed to load tax data.');
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateRate() {
    setFormError('');
    if (!rateForm.name.trim()) {
      setFormError('Name is required');
      return;
    }
    if (!rateForm.code.trim()) {
      setFormError('Code is required');
      return;
    }
    if (!rateForm.rate || parseFloat(rateForm.rate) < 0) {
      setFormError('Valid rate is required');
      return;
    }

    setSubmitting(true);
    try {
      await api.post('/tax/rates', {
        ...rateForm,
        rate: parseFloat(rateForm.rate),
      });
      setCreateRateOpen(false);
      loadData();
    } catch (err) {
      setFormError((axios.isAxiosError(err) && err.response?.data?.error?.message) || 'Failed to create tax rate.');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleCreateReturn() {
    setFormError('');
    if (!returnForm.period.trim()) {
      setFormError('Period is required');
      return;
    }
    if (!returnForm.startDate) {
      setFormError('Start date is required');
      return;
    }
    if (!returnForm.endDate) {
      setFormError('End date is required');
      return;
    }
    if (!returnForm.dueDate) {
      setFormError('Due date is required');
      return;
    }

    setSubmitting(true);
    try {
      await api.post('/tax/returns', {
        ...returnForm,
        taxCollected: parseFloat(returnForm.taxCollected) || 0,
        taxPaid: parseFloat(returnForm.taxPaid) || 0,
      });
      setCreateReturnOpen(false);
      loadData();
    } catch (err) {
      setFormError((axios.isAxiosError(err) && err.response?.data?.error?.message) || 'Failed to create tax return.');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleFileReturn(id: string) {
    try {
      await api.patch(`/tax/returns/${id}/file`);
      loadData();
    } catch (err) {
      console.error('Error filing return:', err);
    }
  }

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4" />
          <div className="h-64 bg-gray-200 rounded" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Tax Management</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Manage tax rates and returns</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        {/* Tax Rates */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="flex items-center gap-2">
                <Calculator className="h-5 w-5 text-indigo-600" />
                Tax Rates
              </CardTitle>
              <Button
                variant="outline"
                className="flex items-center gap-2"
                onClick={() => {
                  setRateForm({ name: '', code: '', rate: '', type: 'SALES_TAX', description: '' });
                  setFormError('');
                  setCreateRateOpen(true);
                }}
              >
                <Plus className="h-4 w-4" /> Add Rate
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {taxRates.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">
                        Code
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">
                        Name
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">
                        Type
                      </th>
                      <th className="text-right py-3 px-4 font-medium text-gray-500 dark:text-gray-400">
                        Rate (%)
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">
                        Status
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">
                        Description
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {taxRates.map((rate) => (
                      <tr key={rate.id} className="border-b hover:bg-gray-50 dark:bg-gray-800">
                        <td className="py-3 px-4 font-mono text-gray-900 dark:text-gray-100">
                          {rate.code}
                        </td>
                        <td className="py-3 px-4 text-gray-900 dark:text-gray-100 font-medium">
                          {rate.name}
                        </td>
                        <td className="py-3 px-4">
                          <Badge className="bg-indigo-100 text-indigo-700">
                            {rate.type.replace('_', ' ')}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-right font-medium">{rate.rate}%</td>
                        <td className="py-3 px-4">
                          <Badge
                            className={
                              rate.isActive
                                ? 'bg-green-100 text-green-700'
                                : 'bg-gray-100 dark:bg-gray-800 text-gray-500'
                            }
                          >
                            {rate.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-gray-500 dark:text-gray-400">
                          {rate.description || '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <Calculator className="h-10 w-10 mx-auto mb-3 opacity-50" />
                <p>No tax rates configured</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Tax Returns */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-indigo-600" />
                Tax Returns
              </CardTitle>
              <Button
                variant="outline"
                className="flex items-center gap-2"
                onClick={() => {
                  setReturnForm({
                    period: '',
                    startDate: '',
                    endDate: '',
                    dueDate: '',
                    taxCollected: '',
                    taxPaid: '',
                  });
                  setFormError('');
                  setCreateReturnOpen(true);
                }}
              >
                <Plus className="h-4 w-4" /> Add Return
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {taxReturns.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">
                        Period
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">
                        Date Range
                      </th>
                      <th className="text-right py-3 px-4 font-medium text-gray-500 dark:text-gray-400">
                        Tax Collected
                      </th>
                      <th className="text-right py-3 px-4 font-medium text-gray-500 dark:text-gray-400">
                        Tax Paid
                      </th>
                      <th className="text-right py-3 px-4 font-medium text-gray-500 dark:text-gray-400">
                        Net Tax
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">
                        Due Date
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">
                        Status
                      </th>
                      <th className="text-right py-3 px-4 font-medium text-gray-500 dark:text-gray-400">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {taxReturns.map((ret) => (
                      <tr key={ret.id} className="border-b hover:bg-gray-50 dark:bg-gray-800">
                        <td className="py-3 px-4 font-medium text-gray-900 dark:text-gray-100">
                          {ret.period}
                        </td>
                        <td className="py-3 px-4 text-gray-600">
                          {new Date(ret.startDate).toLocaleDateString()} -{' '}
                          {new Date(ret.endDate).toLocaleDateString()}
                        </td>
                        <td className="py-3 px-4 text-right font-medium text-green-600">
                          {formatCurrency(ret.taxCollected)}
                        </td>
                        <td className="py-3 px-4 text-right font-medium text-red-600">
                          {formatCurrency(ret.taxPaid)}
                        </td>
                        <td
                          className={`py-3 px-4 text-right font-bold ${ret.netTax >= 0 ? 'text-red-600' : 'text-green-600'}`}
                        >
                          {formatCurrency(ret.netTax)}
                        </td>
                        <td className="py-3 px-4 text-gray-600">
                          {new Date(ret.dueDate).toLocaleDateString()}
                        </td>
                        <td className="py-3 px-4">
                          <Badge
                            className={
                              returnStatusColors[ret.status] ||
                              'bg-gray-100 dark:bg-gray-800 text-gray-700'
                            }
                          >
                            {ret.status}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-right">
                          {(ret.status === 'DRAFT' || ret.status === 'PREPARED') && (
                            <button
                              onClick={() => handleFileReturn(ret.id)}
                              className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded hover:bg-green-200"
                            >
                              File
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <FileText className="h-10 w-10 mx-auto mb-3 opacity-50" />
                <p>No tax returns</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Create Rate Modal */}
      <Modal
        isOpen={createRateOpen}
        onClose={() => setCreateRateOpen(false)}
        title="Add Tax Rate"
        size="lg"
      >
        <div className="space-y-4">
          {formError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm">
              {formError}
            </div>
          )}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="tr-name">Name *</Label>
              <Input
                id="tr-name"
                value={rateForm.name}
                onChange={(e) => setRateForm((p) => ({ ...p, name: e.target.value }))}
                placeholder="e.g. Standard VAT"
              />
            </div>
            <div>
              <Label htmlFor="tr-code">Code *</Label>
              <Input
                id="tr-code"
                value={rateForm.code}
                onChange={(e) => setRateForm((p) => ({ ...p, code: e.target.value }))}
                placeholder="e.g. VAT-STD"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="tr-type">Type</Label>
              <select
                id="tr-type"
                value={rateForm.type}
                onChange={(e) => setRateForm((p) => ({ ...p, type: e.target.value }))}
                className="w-full border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500"
              >
                <option value="SALES_TAX">Sales Tax</option>
                <option value="VAT">VAT</option>
                <option value="GST">GST</option>
                <option value="INCOME_TAX">Income Tax</option>
                <option value="WITHHOLDING">Withholding</option>
                <option value="OTHER">Other</option>
              </select>
            </div>
            <div>
              <Label htmlFor="tr-rate">Rate (%) *</Label>
              <Input
                id="tr-rate"
                type="number"
                step="0.01"
                min="0"
                value={rateForm.rate}
                onChange={(e) => setRateForm((p) => ({ ...p, rate: e.target.value }))}
                placeholder="e.g. 10"
              />
            </div>
          </div>
          <div>
            <Label htmlFor="tr-desc">Description</Label>
            <textarea
              id="tr-desc"
              value={rateForm.description}
              onChange={(e) => setRateForm((p) => ({ ...p, description: e.target.value }))}
              rows={2}
              className="w-full border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>
        <ModalFooter>
          <Button variant="outline" onClick={() => setCreateRateOpen(false)} disabled={submitting}>
            Cancel
          </Button>
          <Button onClick={handleCreateRate} disabled={submitting}>
            {submitting ? 'Creating...' : 'Create Rate'}
          </Button>
        </ModalFooter>
      </Modal>

      {/* Create Return Modal */}
      <Modal
        isOpen={createReturnOpen}
        onClose={() => setCreateReturnOpen(false)}
        title="Add Tax Return"
        size="lg"
      >
        <div className="space-y-4">
          {formError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm">
              {formError}
            </div>
          )}
          <div>
            <Label htmlFor="ret-period">Period *</Label>
            <Input
              id="ret-period"
              value={returnForm.period}
              onChange={(e) => setReturnForm((p) => ({ ...p, period: e.target.value }))}
              placeholder="e.g. Q1 2026"
            />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="ret-start">Start Date *</Label>
              <Input
                id="ret-start"
                type="date"
                value={returnForm.startDate}
                onChange={(e) => setReturnForm((p) => ({ ...p, startDate: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="ret-end">End Date *</Label>
              <Input
                id="ret-end"
                type="date"
                value={returnForm.endDate}
                onChange={(e) => setReturnForm((p) => ({ ...p, endDate: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="ret-due">Due Date *</Label>
              <Input
                id="ret-due"
                type="date"
                value={returnForm.dueDate}
                onChange={(e) => setReturnForm((p) => ({ ...p, dueDate: e.target.value }))}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="ret-collected">Tax Collected</Label>
              <Input
                id="ret-collected"
                type="number"
                step="0.01"
                value={returnForm.taxCollected}
                onChange={(e) => setReturnForm((p) => ({ ...p, taxCollected: e.target.value }))}
                placeholder="0.00"
              />
            </div>
            <div>
              <Label htmlFor="ret-paid">Tax Paid</Label>
              <Input
                id="ret-paid"
                type="number"
                step="0.01"
                value={returnForm.taxPaid}
                onChange={(e) => setReturnForm((p) => ({ ...p, taxPaid: e.target.value }))}
                placeholder="0.00"
              />
            </div>
          </div>
        </div>
        <ModalFooter>
          <Button
            variant="outline"
            onClick={() => setCreateReturnOpen(false)}
            disabled={submitting}
          >
            Cancel
          </Button>
          <Button onClick={handleCreateReturn} disabled={submitting}>
            {submitting ? 'Creating...' : 'Create Return'}
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}
