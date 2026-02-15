'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, Button, Input, Badge, Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@ims/ui';
import { Layers, Search, Warehouse, AlertTriangle, Package, Filter } from 'lucide-react';
import { inventoryApi } from '@/lib/api';

interface InventoryItem {
  id: string;
  productId: string;
  warehouseId: string;
  quantityOnHand: number;
  quantityReserved: number;
  quantityOnOrder: number;
  quantityAvailable: number;
  binLocation?: string;
  averageCost: number;
  inventoryValue: number;
  product: {
    id: string;
    sku: string;
    name: string;
    reorderPoint: number;
  };
  warehouse: {
    id: string;
    code: string;
    name: string;
  };
}

interface WarehouseOption {
  id: string;
  code: string;
  name: string;
}

export default function StockLevelsPage() {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [warehouses, setWarehouses] = useState<WarehouseOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedWarehouse, setSelectedWarehouse] = useState<string>('');
  const [search, setSearch] = useState('');
  const [meta, setMeta] = useState({ page: 1, limit: 50, total: 0, totalPages: 0 });

  useEffect(() => {
    loadWarehouses();
  }, []);

  useEffect(() => {
    loadInventory();
  }, [meta.page, selectedWarehouse]);

  async function loadWarehouses() {
    try {
      const res = await inventoryApi.getWarehouses({ limit: 100 });
      setWarehouses(res.data.data || []);
    } catch (error) {
      console.error('Failed to load warehouses:', error);
    }
  }

  async function loadInventory() {
    try {
      setLoading(true);
      const params: Record<string, any> = {
        page: meta.page,
        limit: meta.limit,
      };
      if (selectedWarehouse) params.warehouseId = selectedWarehouse;

      const res = await inventoryApi.getInventory(params);
      setInventory(res.data.data || []);
      setMeta(res.data.meta || meta);
    } catch (error) {
      console.error('Failed to load inventory:', error);
    } finally {
      setLoading(false);
    }
  }

  const filteredInventory = inventory.filter(item => {
    if (!search) return true;
    const searchLower = search.toLowerCase();
    return (
      item.product.sku.toLowerCase().includes(searchLower) ||
      item.product.name.toLowerCase().includes(searchLower) ||
      item.binLocation?.toLowerCase().includes(searchLower)
    );
  });

  const getStockStatus = (item: InventoryItem) => {
    if (item.quantityAvailable <= 0) {
      return { label: 'Out of Stock', variant: 'destructive' as const, icon: AlertTriangle };
    }
    if (item.quantityOnHand <= item.product.reorderPoint) {
      return { label: 'Low Stock', variant: 'secondary' as const, icon: AlertTriangle };
    }
    return { label: 'In Stock', variant: 'default' as const, icon: Package };
  };

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Stock Levels</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">Multi-warehouse inventory view</p>
          </div>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
                <Input
                  placeholder="Search by SKU, name, or bin location..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
              <select
                value={selectedWarehouse}
                onChange={(e) => {
                  setSelectedWarehouse(e.target.value);
                  setMeta({ ...meta, page: 1 });
                }}
                className="px-4 py-2 border rounded-lg bg-white dark:bg-gray-900"
              >
                <option value="">All Warehouses</option>
                {warehouses.map((wh) => (
                  <option key={wh.id} value={wh.id}>
                    {wh.name} ({wh.code})
                  </option>
                ))}
              </select>
              <Button variant="outline">
                <Filter className="h-4 w-4 mr-2" />
                More Filters
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Inventory Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Layers className="h-5 w-5 text-sky-500" />
              Stock Levels {selectedWarehouse && `- ${warehouses.find(w => w.id === selectedWarehouse)?.name}`}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="animate-pulse space-y-4">
                {[1, 2, 3, 4, 5].map(i => (
                  <div key={i} className="h-12 bg-gray-200 rounded" />
                ))}
              </div>
            ) : filteredInventory.length > 0 ? (
              <>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead>Warehouse</TableHead>
                      <TableHead>Bin Location</TableHead>
                      <TableHead className="text-right">On Hand</TableHead>
                      <TableHead className="text-right">Reserved</TableHead>
                      <TableHead className="text-right">Available</TableHead>
                      <TableHead className="text-right">On Order</TableHead>
                      <TableHead className="text-right">Value</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredInventory.map((item) => {
                      const status = getStockStatus(item);
                      const isLow = item.quantityOnHand <= item.product.reorderPoint;

                      return (
                        <TableRow key={item.id} className={isLow ? 'bg-orange-50' : ''}>
                          <TableCell>
                            <div>
                              <p className="font-medium">{item.product.name}</p>
                              <p className="text-xs text-gray-500 dark:text-gray-400 font-mono">{item.product.sku}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Warehouse className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                              <span>{item.warehouse.name}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            {item.binLocation ? (
                              <Badge variant="outline">{item.binLocation}</Badge>
                            ) : (
                              <span className="text-gray-400 dark:text-gray-500">-</span>
                            )}
                          </TableCell>
                          <TableCell className="text-right font-semibold">
                            {item.quantityOnHand.toLocaleString()}
                          </TableCell>
                          <TableCell className="text-right text-orange-600">
                            {item.quantityReserved > 0 ? item.quantityReserved.toLocaleString() : '-'}
                          </TableCell>
                          <TableCell className="text-right font-semibold text-green-600">
                            {item.quantityAvailable.toLocaleString()}
                          </TableCell>
                          <TableCell className="text-right text-blue-600">
                            {item.quantityOnOrder > 0 ? item.quantityOnOrder.toLocaleString() : '-'}
                          </TableCell>
                          <TableCell className="text-right font-mono">
                            ${item.inventoryValue.toLocaleString()}
                          </TableCell>
                          <TableCell>
                            <Badge variant={status.variant}>
                              {status.label}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>

                {/* Pagination */}
                <div className="flex items-center justify-between mt-4 pt-4 border-t">
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Showing {filteredInventory.length} of {meta.total} items
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={meta.page <= 1}
                      onClick={() => setMeta({ ...meta, page: meta.page - 1 })}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={meta.page >= meta.totalPages}
                      onClick={() => setMeta({ ...meta, page: meta.page + 1 })}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center py-12">
                <Layers className="h-12 w-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400">No inventory records found</p>
                <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
                  Add products and receive stock to see inventory levels
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-gray-500 dark:text-gray-400">Total Items</p>
              <p className="text-2xl font-bold">{meta.total}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-gray-500 dark:text-gray-400">Total Quantity</p>
              <p className="text-2xl font-bold">
                {inventory.reduce((sum, item) => sum + item.quantityOnHand, 0).toLocaleString()}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-gray-500 dark:text-gray-400">Total Value</p>
              <p className="text-2xl font-bold">
                ${inventory.reduce((sum, item) => sum + item.inventoryValue, 0).toLocaleString()}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-gray-500 dark:text-gray-400">Low Stock Items</p>
              <p className="text-2xl font-bold text-orange-600">
                {inventory.filter(item => item.quantityOnHand <= item.product.reorderPoint).length}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
