'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, Button, Input, Badge } from '@ims/ui';
import { ArrowRightLeft, Plus, Minus, RefreshCw, Warehouse, Search, Package } from 'lucide-react';
import { inventoryApi } from '@/lib/api';

interface Product {
  id: string;
  sku: string;
  name: string;
}

interface WarehouseOption {
  id: string;
  code: string;
  name: string;
}

type AdjustmentType = 'ADJUSTMENT_IN' | 'ADJUSTMENT_OUT' | 'CYCLE_COUNT' | 'TRANSFER' | 'RECEIVE' | 'ISSUE';

export default function AdjustmentsPage() {
  const [adjustmentType, setAdjustmentType] = useState<AdjustmentType>('ADJUSTMENT_IN');
  const [products, setProducts] = useState<Product[]>([]);
  const [warehouses, setWarehouses] = useState<WarehouseOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState({
    quantity: 0,
    warehouseId: '',
    fromWarehouseId: '',
    toWarehouseId: '',
    reason: '',
    notes: '',
    binLocation: '',
    lotNumber: '',
    unitCost: 0,
  });
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    loadWarehouses();
  }, []);

  async function loadWarehouses() {
    try {
      const res = await inventoryApi.getWarehouses({ limit: 100 });
      setWarehouses(res.data.data || []);
    } catch (error) {
      console.error('Failed to load warehouses:', error);
    }
  }

  async function searchProducts(query: string) {
    if (!query || query.length < 2) {
      setProducts([]);
      return;
    }
    try {
      const res = await inventoryApi.getProducts({ search: query, limit: 10 });
      setProducts(res.data.data || []);
    } catch (error) {
      console.error('Failed to search products:', error);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedProduct) {
      setError('Please select a product');
      return;
    }
    if (!formData.warehouseId && adjustmentType !== 'TRANSFER') {
      setError('Please select a warehouse');
      return;
    }

    setLoading(true);
    setError('');
    setResult(null);

    try {
      let response;

      switch (adjustmentType) {
        case 'ADJUSTMENT_IN':
        case 'ADJUSTMENT_OUT':
        case 'CYCLE_COUNT':
          response = await inventoryApi.adjustStock({
            productId: selectedProduct.id,
            warehouseId: formData.warehouseId,
            adjustmentType,
            quantity: formData.quantity,
            reason: formData.reason,
            notes: formData.notes,
            binLocation: formData.binLocation,
            lotNumber: formData.lotNumber,
            unitCost: formData.unitCost,
          });
          break;

        case 'TRANSFER':
          response = await inventoryApi.transferStock({
            productId: selectedProduct.id,
            fromWarehouseId: formData.fromWarehouseId,
            toWarehouseId: formData.toWarehouseId,
            quantity: formData.quantity,
            reason: formData.reason,
            notes: formData.notes,
          });
          break;

        case 'RECEIVE':
          response = await inventoryApi.receiveGoods({
            productId: selectedProduct.id,
            warehouseId: formData.warehouseId,
            quantity: formData.quantity,
            unitCost: formData.unitCost,
            binLocation: formData.binLocation,
            lotNumber: formData.lotNumber,
            notes: formData.notes,
          });
          break;

        case 'ISSUE':
          response = await inventoryApi.issueGoods({
            productId: selectedProduct.id,
            warehouseId: formData.warehouseId,
            quantity: formData.quantity,
            binLocation: formData.binLocation,
            lotNumber: formData.lotNumber,
            notes: formData.notes,
          });
          break;
      }

      setResult(response?.data);
      // Reset form
      setSelectedProduct(null);
      setSearchQuery('');
      setFormData({
        quantity: 0,
        warehouseId: '',
        fromWarehouseId: '',
        toWarehouseId: '',
        reason: '',
        notes: '',
        binLocation: '',
        lotNumber: '',
        unitCost: 0,
      });
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Operation failed');
    } finally {
      setLoading(false);
    }
  }

  const adjustmentTypes = [
    { value: 'ADJUSTMENT_IN', label: 'Add Stock', icon: Plus, color: 'bg-green-100 text-green-700' },
    { value: 'ADJUSTMENT_OUT', label: 'Remove Stock', icon: Minus, color: 'bg-red-100 text-red-700' },
    { value: 'CYCLE_COUNT', label: 'Cycle Count', icon: RefreshCw, color: 'bg-blue-100 text-blue-700' },
    { value: 'TRANSFER', label: 'Transfer', icon: ArrowRightLeft, color: 'bg-purple-100 text-purple-700' },
    { value: 'RECEIVE', label: 'Receive Goods', icon: Plus, color: 'bg-green-100 text-green-700' },
    { value: 'ISSUE', label: 'Issue Goods', icon: Minus, color: 'bg-orange-100 text-orange-700' },
  ];

  return (
    <div className="p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Stock Adjustments</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Cycle counts, transfers, and inventory adjustments</p>
        </div>

        {/* Adjustment Type Selection */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Select Adjustment Type</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {adjustmentTypes.map((type) => {
                const Icon = type.icon;
                const isSelected = adjustmentType === type.value;
                return (
                  <button
                    key={type.value}
                    onClick={() => setAdjustmentType(type.value as AdjustmentType)}
                    className={`flex items-center gap-3 p-4 rounded-lg border-2 transition-all ${
                      isSelected
                        ? 'border-sky-500 bg-sky-50'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <div className={`p-2 rounded-lg ${type.color}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <span className="font-medium">{type.label}</span>
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Adjustment Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ArrowRightLeft className="h-5 w-5 text-sky-500" />
              {adjustmentTypes.find(t => t.value === adjustmentType)?.label}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="p-3 bg-red-50 text-red-700 rounded-lg text-sm">{error}</div>
              )}

              {result && (
                <div className="p-4 bg-green-50 text-green-700 rounded-lg">
                  <p className="font-medium">Operation Successful!</p>
                  <p className="text-sm mt-1">
                    {adjustmentType === 'TRANSFER'
                      ? `Transfer reference: ${result.data?.transferReference}`
                      : `Transaction: ${result.data?.transaction?.referenceNumber}`
                    }
                  </p>
                </div>
              )}

              {/* Product Search */}
              <div>
                <label className="block text-sm font-medium mb-2">Product *</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
                  <Input
                    placeholder="Search by SKU or product name..."
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      searchProducts(e.target.value);
                    }}
                    className="pl-10"
                  />
                </div>
                {products.length > 0 && !selectedProduct && (
                  <div className="mt-2 border rounded-lg divide-y max-h-48 overflow-auto">
                    {products.map((product) => (
                      <button
                        key={product.id}
                        type="button"
                        onClick={() => {
                          setSelectedProduct(product);
                          setSearchQuery(product.name);
                          setProducts([]);
                        }}
                        className="w-full px-4 py-2 text-left hover:bg-gray-50 dark:bg-gray-800 flex items-center gap-3"
                      >
                        <Package className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                        <div>
                          <p className="font-medium">{product.name}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{product.sku}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
                {selectedProduct && (
                  <div className="mt-2 p-3 bg-sky-50 rounded-lg flex items-center justify-between">
                    <div>
                      <p className="font-medium">{selectedProduct.name}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{selectedProduct.sku}</p>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setSelectedProduct(null);
                        setSearchQuery('');
                      }}
                    >
                      Change
                    </Button>
                  </div>
                )}
              </div>

              {/* Warehouse Selection */}
              {adjustmentType === 'TRANSFER' ? (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">From Warehouse *</label>
                    <select
                      value={formData.fromWarehouseId}
                      onChange={(e) => setFormData({ ...formData, fromWarehouseId: e.target.value })}
                      className="w-full px-4 py-2 border rounded-lg"
                      required
                    >
                      <option value="">Select source...</option>
                      {warehouses.map((wh) => (
                        <option key={wh.id} value={wh.id}>{wh.name} ({wh.code})</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">To Warehouse *</label>
                    <select
                      value={formData.toWarehouseId}
                      onChange={(e) => setFormData({ ...formData, toWarehouseId: e.target.value })}
                      className="w-full px-4 py-2 border rounded-lg"
                      required
                    >
                      <option value="">Select destination...</option>
                      {warehouses.filter(wh => wh.id !== formData.fromWarehouseId).map((wh) => (
                        <option key={wh.id} value={wh.id}>{wh.name} ({wh.code})</option>
                      ))}
                    </select>
                  </div>
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-medium mb-2">Warehouse *</label>
                  <select
                    value={formData.warehouseId}
                    onChange={(e) => setFormData({ ...formData, warehouseId: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg"
                    required
                  >
                    <option value="">Select warehouse...</option>
                    {warehouses.map((wh) => (
                      <option key={wh.id} value={wh.id}>{wh.name} ({wh.code})</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Quantity */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    {adjustmentType === 'CYCLE_COUNT' ? 'New Count *' : 'Quantity *'}
                  </label>
                  <Input
                    type="number"
                    min="0"
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 0 })}
                    required
                  />
                </div>
                {(adjustmentType === 'RECEIVE' || adjustmentType === 'ADJUSTMENT_IN') && (
                  <div>
                    <label className="block text-sm font-medium mb-2">Unit Cost</label>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.unitCost}
                      onChange={(e) => setFormData({ ...formData, unitCost: parseFloat(e.target.value) || 0 })}
                    />
                  </div>
                )}
              </div>

              {/* Optional Fields */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Bin Location</label>
                  <Input
                    value={formData.binLocation}
                    onChange={(e) => setFormData({ ...formData, binLocation: e.target.value })}
                    placeholder="e.g., A-01-02"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Lot Number</label>
                  <Input
                    value={formData.lotNumber}
                    onChange={(e) => setFormData({ ...formData, lotNumber: e.target.value })}
                    placeholder="e.g., LOT-2024-001"
                  />
                </div>
              </div>

              {/* Reason */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Reason {['ADJUSTMENT_IN', 'ADJUSTMENT_OUT', 'CYCLE_COUNT'].includes(adjustmentType) ? '*' : ''}
                </label>
                <Input
                  value={formData.reason}
                  onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                  placeholder="Reason for adjustment..."
                  required={['ADJUSTMENT_IN', 'ADJUSTMENT_OUT', 'CYCLE_COUNT'].includes(adjustmentType)}
                />
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium mb-2">Notes</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                  rows={3}
                  placeholder="Additional notes..."
                />
              </div>

              {/* Submit */}
              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setSelectedProduct(null);
                    setSearchQuery('');
                    setFormData({
                      quantity: 0,
                      warehouseId: '',
                      fromWarehouseId: '',
                      toWarehouseId: '',
                      reason: '',
                      notes: '',
                      binLocation: '',
                      lotNumber: '',
                      unitCost: 0,
                    });
                    setResult(null);
                    setError('');
                  }}
                >
                  Clear
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? 'Processing...' : `Submit ${adjustmentTypes.find(t => t.value === adjustmentType)?.label}`}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
