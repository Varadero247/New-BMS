'use client';

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
import { Plus, Search, Landmark, ArrowUpRight, ArrowDownLeft, Filter } from 'lucide-react';
import { api } from '@/lib/api';

interface BankAccount {
  id: string;
  name: string;
  accountNumber: string;
  bankName: string;
  type: string;
  currency: string;
  balance: number;
  isActive: boolean;
}

interface Transaction {
  id: string;
  bankAccountId: string;
  date: string;
  description: string;
  reference?: string;
  type: string;
  amount: number;
  balance: number;
  isReconciled: boolean;
  category?: string;
}

const accountTypeColors: Record<string, string> = {
  CHECKING: 'bg-blue-100 text-blue-700',
  SAVINGS: 'bg-green-100 text-green-700',
  CREDIT_CARD: 'bg-red-100 text-red-700',
  MONEY_MARKET: 'bg-purple-100 text-purple-700',
  OTHER: 'bg-gray-100 dark:bg-gray-800 text-gray-700',
};

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(amount);
}

export default function BankingPage() {
  const [accounts, setAccounts] = useState<BankAccount[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedAccount, setSelectedAccount] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('');

  const [createAccountOpen, setCreateAccountOpen] = useState(false);
  const [createTxOpen, setCreateTxOpen] = useState(false);
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const [accountForm, setAccountForm] = useState({
    name: '',
    accountNumber: '',
    bankName: '',
    type: 'CHECKING',
    currency: 'USD',
    balance: '',
  });

  const [txForm, setTxForm] = useState({
    bankAccountId: '',
    date: '',
    description: '',
    reference: '',
    type: 'DEBIT',
    amount: '',
    category: '',
  });

  useEffect(() => {
    loadAccounts();
  }, []);

  useEffect(() => {
    if (selectedAccount) {
      loadTransactions(selectedAccount);
    } else {
      loadAllTransactions();
    }
  }, [selectedAccount]);

  async function loadAccounts() {
    try {
      setError(null);
      const res = await api.get('/banking/accounts');
      setAccounts(res.data.data || []);
    } catch (err) {
      setError('Failed to load bank accounts.');
    } finally {
      setLoading(false);
    }
  }

  async function loadTransactions(accountId: string) {
    try {
      const res = await api.get(`/banking/accounts/${accountId}/transactions`);
      setTransactions(res.data.data || []);
    } catch (err) {
      console.error('Error loading transactions:', err);
    }
  }

  async function loadAllTransactions() {
    try {
      const res = await api.get('/banking/transactions');
      setTransactions(res.data.data || []);
    } catch (err) {
      console.error('Error loading transactions:', err);
    }
  }

  async function handleCreateAccount() {
    setFormError('');
    if (!accountForm.name.trim()) {
      setFormError('Account name is required');
      return;
    }
    if (!accountForm.accountNumber.trim()) {
      setFormError('Account number is required');
      return;
    }
    if (!accountForm.bankName.trim()) {
      setFormError('Bank name is required');
      return;
    }

    setSubmitting(true);
    try {
      await api.post('/banking/accounts', {
        ...accountForm,
        balance: parseFloat(accountForm.balance) || 0,
      });
      setCreateAccountOpen(false);
      loadAccounts();
    } catch (err: unknown) {
      setFormError(err?.response?.data?.error?.message || 'Failed to create bank account.');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleCreateTransaction() {
    setFormError('');
    if (!txForm.bankAccountId) {
      setFormError('Bank account is required');
      return;
    }
    if (!txForm.date) {
      setFormError('Date is required');
      return;
    }
    if (!txForm.description.trim()) {
      setFormError('Description is required');
      return;
    }
    if (!txForm.amount || parseFloat(txForm.amount) <= 0) {
      setFormError('Amount must be greater than 0');
      return;
    }

    setSubmitting(true);
    try {
      await api.post('/banking/transactions', {
        ...txForm,
        amount: parseFloat(txForm.amount),
      });
      setCreateTxOpen(false);
      if (selectedAccount) loadTransactions(selectedAccount);
      else loadAllTransactions();
      loadAccounts();
    } catch (err: unknown) {
      setFormError(err?.response?.data?.error?.message || 'Failed to create transaction.');
    } finally {
      setSubmitting(false);
    }
  }

  const totalBalance = accounts.reduce((sum, a) => sum + (a.balance || 0), 0);

  const filteredTransactions = transactions.filter((tx) => {
    const matchesSearch =
      !searchTerm ||
      tx.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (tx.reference || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = !typeFilter || tx.type === typeFilter;
    return matchesSearch && matchesType;
  });

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4" />
          <div className="grid grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 bg-gray-200 rounded" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Banking</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              Manage bank accounts and transactions
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="flex items-center gap-2"
              onClick={() => {
                setAccountForm({
                  name: '',
                  accountNumber: '',
                  bankName: '',
                  type: 'CHECKING',
                  currency: 'USD',
                  balance: '',
                });
                setFormError('');
                setCreateAccountOpen(true);
              }}
            >
              <Plus className="h-4 w-4" /> Add Account
            </Button>
            <Button
              className="flex items-center gap-2"
              onClick={() => {
                setTxForm({
                  bankAccountId: selectedAccount || '',
                  date: new Date().toISOString().split('T')[0],
                  description: '',
                  reference: '',
                  type: 'DEBIT',
                  amount: '',
                  category: '',
                });
                setFormError('');
                setCreateTxOpen(true);
              }}
            >
              <Plus className="h-4 w-4" /> Record Transaction
            </Button>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        {/* Total Balance */}
        <Card className="mb-6 bg-indigo-50 border-indigo-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-indigo-600 font-medium">Total Cash Position</p>
                <p className="text-3xl font-bold text-indigo-900">{formatCurrency(totalBalance)}</p>
                <p className="text-xs text-indigo-500 mt-1">{accounts.length} account(s)</p>
              </div>
              <Landmark className="h-12 w-12 text-indigo-400" />
            </div>
          </CardContent>
        </Card>

        {/* Bank Account Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {accounts.map((account) => (
            <Card
              key={account.id}
              className={`cursor-pointer transition-all hover:shadow-md ${selectedAccount === account.id ? 'ring-2 ring-indigo-500' : ''}`}
              onClick={() => setSelectedAccount(selectedAccount === account.id ? '' : account.id)}
            >
              <CardContent className="pt-6">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-gray-100">{account.name}</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {account.bankName} - {account.accountNumber}
                    </p>
                  </div>
                  <Badge
                    className={
                      accountTypeColors[account.type] ||
                      'bg-gray-100 dark:bg-gray-800 text-gray-700'
                    }
                  >
                    {account.type}
                  </Badge>
                </div>
                <p
                  className={`text-2xl font-bold ${account.balance >= 0 ? 'text-green-700' : 'text-red-700'}`}
                >
                  {formatCurrency(account.balance)}
                </p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{account.currency}</p>
              </CardContent>
            </Card>
          ))}
          {accounts.length === 0 && (
            <div className="col-span-3 text-center py-8 text-gray-500 dark:text-gray-400">
              <Landmark className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No bank accounts yet</p>
            </div>
          )}
        </div>

        {/* Transactions */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5 text-indigo-600" />
                Transactions {selectedAccount ? '(Filtered)' : '(All)'}
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4 items-center mb-4">
              <div className="flex-1 min-w-[200px]">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
                  <input
                    type="text"
                    aria-label="Search transactions..."
                    placeholder="Search transactions..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>
              <select
                aria-label="Filter by type"
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="border rounded-md px-3 py-2 text-sm"
              >
                <option value="">All Types</option>
                <option value="CREDIT">Credits</option>
                <option value="DEBIT">Debits</option>
              </select>
            </div>

            {filteredTransactions.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">
                        Date
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">
                        Description
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">
                        Reference
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">
                        Type
                      </th>
                      <th className="text-right py-3 px-4 font-medium text-gray-500 dark:text-gray-400">
                        Amount
                      </th>
                      <th className="text-right py-3 px-4 font-medium text-gray-500 dark:text-gray-400">
                        Balance
                      </th>
                      <th className="text-center py-3 px-4 font-medium text-gray-500 dark:text-gray-400">
                        Reconciled
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTransactions.map((tx) => (
                      <tr key={tx.id} className="border-b hover:bg-gray-50 dark:bg-gray-800">
                        <td className="py-3 px-4 text-gray-600">
                          {new Date(tx.date).toLocaleDateString()}
                        </td>
                        <td className="py-3 px-4 text-gray-900 dark:text-gray-100">
                          {tx.description}
                        </td>
                        <td className="py-3 px-4 text-gray-500 dark:text-gray-400 font-mono text-xs">
                          {tx.reference || '-'}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-1">
                            {tx.type === 'CREDIT' ? (
                              <ArrowDownLeft className="h-4 w-4 text-green-600" />
                            ) : (
                              <ArrowUpRight className="h-4 w-4 text-red-600" />
                            )}
                            <span
                              className={tx.type === 'CREDIT' ? 'text-green-700' : 'text-red-700'}
                            >
                              {tx.type}
                            </span>
                          </div>
                        </td>
                        <td
                          className={`py-3 px-4 text-right font-medium ${tx.type === 'CREDIT' ? 'text-green-600' : 'text-red-600'}`}
                        >
                          {tx.type === 'CREDIT' ? '+' : '-'}
                          {formatCurrency(tx.amount)}
                        </td>
                        <td className="py-3 px-4 text-right font-medium">
                          {formatCurrency(tx.balance || 0)}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <Badge
                            className={
                              tx.isReconciled
                                ? 'bg-green-100 text-green-700'
                                : 'bg-yellow-100 text-yellow-700'
                            }
                          >
                            {tx.isReconciled ? 'Yes' : 'No'}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                <Landmark className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No transactions found</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Create Account Modal */}
      <Modal
        isOpen={createAccountOpen}
        onClose={() => setCreateAccountOpen(false)}
        title="Add Bank Account"
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
              <Label htmlFor="ba-name">Account Name *</Label>
              <Input
                id="ba-name"
                value={accountForm.name}
                onChange={(e) => setAccountForm((prev) => ({ ...prev, name: e.target.value }))}
                placeholder="e.g. Operating Account"
              />
            </div>
            <div>
              <Label htmlFor="ba-number">Account Number *</Label>
              <Input
                id="ba-number"
                value={accountForm.accountNumber}
                onChange={(e) =>
                  setAccountForm((prev) => ({ ...prev, accountNumber: e.target.value }))
                }
                placeholder="e.g. ****1234"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="ba-bank">Bank Name *</Label>
              <Input
                id="ba-bank"
                value={accountForm.bankName}
                onChange={(e) => setAccountForm((prev) => ({ ...prev, bankName: e.target.value }))}
                placeholder="e.g. First National Bank"
              />
            </div>
            <div>
              <Label htmlFor="ba-type">Account Type</Label>
              <select
                id="ba-type"
                value={accountForm.type}
                onChange={(e) => setAccountForm((prev) => ({ ...prev, type: e.target.value }))}
                className="w-full border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500"
              >
                <option value="CHECKING">Checking</option>
                <option value="SAVINGS">Savings</option>
                <option value="CREDIT_CARD">Credit Card</option>
                <option value="MONEY_MARKET">Money Market</option>
                <option value="OTHER">Other</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="ba-currency">Currency</Label>
              <Input
                id="ba-currency"
                value={accountForm.currency}
                onChange={(e) => setAccountForm((prev) => ({ ...prev, currency: e.target.value }))}
                placeholder="USD"
              />
            </div>
            <div>
              <Label htmlFor="ba-balance">Opening Balance</Label>
              <Input
                id="ba-balance"
                type="number"
                step="0.01"
                value={accountForm.balance}
                onChange={(e) => setAccountForm((prev) => ({ ...prev, balance: e.target.value }))}
                placeholder="0.00"
              />
            </div>
          </div>
        </div>
        <ModalFooter>
          <Button
            variant="outline"
            onClick={() => setCreateAccountOpen(false)}
            disabled={submitting}
          >
            Cancel
          </Button>
          <Button onClick={handleCreateAccount} disabled={submitting}>
            {submitting ? 'Creating...' : 'Create Account'}
          </Button>
        </ModalFooter>
      </Modal>

      {/* Create Transaction Modal */}
      <Modal
        isOpen={createTxOpen}
        onClose={() => setCreateTxOpen(false)}
        title="Record Transaction"
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
              <Label htmlFor="tx-account">Bank Account *</Label>
              <select
                id="tx-account"
                value={txForm.bankAccountId}
                onChange={(e) => setTxForm((prev) => ({ ...prev, bankAccountId: e.target.value }))}
                className="w-full border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">Select account</option>
                {accounts.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name} ({a.accountNumber})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label htmlFor="tx-date">Date *</Label>
              <Input
                id="tx-date"
                type="date"
                value={txForm.date}
                onChange={(e) => setTxForm((prev) => ({ ...prev, date: e.target.value }))}
              />
            </div>
          </div>
          <div>
            <Label htmlFor="tx-desc">Description *</Label>
            <Input
              id="tx-desc"
              value={txForm.description}
              onChange={(e) => setTxForm((prev) => ({ ...prev, description: e.target.value }))}
              placeholder="Transaction description"
            />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="tx-type">Type</Label>
              <select
                id="tx-type"
                value={txForm.type}
                onChange={(e) => setTxForm((prev) => ({ ...prev, type: e.target.value }))}
                className="w-full border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500"
              >
                <option value="DEBIT">Debit (Money Out)</option>
                <option value="CREDIT">Credit (Money In)</option>
              </select>
            </div>
            <div>
              <Label htmlFor="tx-amount">Amount *</Label>
              <Input
                id="tx-amount"
                type="number"
                step="0.01"
                min="0"
                value={txForm.amount}
                onChange={(e) => setTxForm((prev) => ({ ...prev, amount: e.target.value }))}
                placeholder="0.00"
              />
            </div>
            <div>
              <Label htmlFor="tx-ref">Reference</Label>
              <Input
                id="tx-ref"
                value={txForm.reference}
                onChange={(e) => setTxForm((prev) => ({ ...prev, reference: e.target.value }))}
                placeholder="Check #, etc."
              />
            </div>
          </div>
          <div>
            <Label htmlFor="tx-cat">Category</Label>
            <Input
              id="tx-cat"
              value={txForm.category}
              onChange={(e) => setTxForm((prev) => ({ ...prev, category: e.target.value }))}
              placeholder="e.g. Operating Expenses"
            />
          </div>
        </div>
        <ModalFooter>
          <Button variant="outline" onClick={() => setCreateTxOpen(false)} disabled={submitting}>
            Cancel
          </Button>
          <Button onClick={handleCreateTransaction} disabled={submitting}>
            {submitting ? 'Recording...' : 'Record Transaction'}
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}
