'use client';

import axios from 'axios';
import { useEffect, useState } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Button,
  Input,
  Badge } from '@ims/ui';
import {
  Warehouse,
  Plus,
  Search,
  Edit,
  Trash2,
  MapPin,
  Package,
  DollarSign } from 'lucide-react';
import { inventoryApi } from '@/lib/api';

interface WarehouseItem {
  id: string;
  code: string;
  name: string;
  description?: string;
  address?: any;
  totalCapacity?: number;
  usedCapacity?: number;
  capacityUnit: string;
  managerId?: string;
  phone?: string;
  email?: string;
  isDefault: boolean;
  isActive: boolean;
  stats?: {
    totalProducts: number;
    totalQuantity: number;
    totalValue: number;
  };
}

export default function WarehousesPage() {
  const [warehouses, setWarehouses] = useState<WarehouseItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingWarehouse, setEditingWarehouse] = useState<WarehouseItem | null>(null);

  useEffect(() => {
    loadWarehouses();
  }, []);

  async function loadWarehouses() {
    try {
      setLoading(true);
      const res = await inventoryApi.getWarehouses({ limit: 100 });
      setWarehouses(res.data.data || []);
    } catch (error) {
      console.error('Failed to load warehouses:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this warehouse?')) return;
    try {
      await inventoryApi.deleteWarehouse(id);
      loadWarehouses();
    } catch (error: any) {
      alert((axios.isAxiosError(error) && error.response?.data?.error)?.message || 'Failed to delete warehouse');
    }
  }

  const filteredWarehouses = warehouses.filter((wh) => {
    if (!search) return true;
    const searchLower = search.toLowerCase();
    return (
      wh.code.toLowerCase().includes(searchLower) || wh.name.toLowerCase().includes(searchLower)
    );
  });

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Warehouses</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              Manage storage locations and capacity
            </p>
          </div>
          <Button
            onClick={() => {
              setEditingWarehouse(null);
              setShowModal(true);
            }}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Warehouse
          </Button>
        </div>

        {/* Search */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
              <Input
                aria-label="Search warehouses..."
                placeholder="Search warehouses..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Warehouse Cards */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-48 bg-gray-200 rounded-lg animate-pulse" />
            ))}
          </div>
        ) : filteredWarehouses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredWarehouses.map((warehouse) => (
              <Card
                key={warehouse.id}
                className={`relative ${!warehouse.isActive ? 'opacity-60' : ''}`}
              >
                {warehouse.isDefault && (
                  <Badge className="absolute top-4 right-4" variant="default">
                    Default
                  </Badge>
                )}
                <CardHeader>
                  <div className="flex items-start gap-3">
                    <div className="p-3 bg-sky-100 rounded-lg">
                      <Warehouse className="h-6 w-6 text-sky-600" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{warehouse.name}</CardTitle>
                      <p className="text-sm text-gray-500 dark:text-gray-400 font-mono">
                        {warehouse.code}
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {warehouse.description && (
                    <p className="text-sm text-gray-600 mb-4">{warehouse.description}</p>
                  )}

                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div className="text-center p-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <Package className="h-4 w-4 text-gray-400 dark:text-gray-500 mx-auto mb-1" />
                      <p className="text-lg font-bold">{warehouse.stats?.totalProducts || 0}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Products</p>
                    </div>
                    <div className="text-center p-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <Warehouse className="h-4 w-4 text-gray-400 dark:text-gray-500 mx-auto mb-1" />
                      <p className="text-lg font-bold">
                        {(warehouse.stats?.totalQuantity || 0).toLocaleString()}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Units</p>
                    </div>
                    <div className="text-center p-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <DollarSign className="h-4 w-4 text-gray-400 dark:text-gray-500 mx-auto mb-1" />
                      <p className="text-lg font-bold">
                        ${((warehouse.stats?.totalValue || 0) / 1000).toFixed(0)}k
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Value</p>
                    </div>
                  </div>

                  {/* Contact */}
                  {(warehouse.phone || warehouse.email) && (
                    <div className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                      {warehouse.phone && <p>{warehouse.phone}</p>}
                      {warehouse.email && <p>{warehouse.email}</p>}
                    </div>
                  )}

                  {/* Address */}
                  {warehouse.address && (
                    <div className="flex items-start gap-2 text-sm text-gray-500 dark:text-gray-400 mb-4">
                      <MapPin className="h-4 w-4 mt-0.5" />
                      <span>
                        {[
                          warehouse.address.street,
                          warehouse.address.city,
                          warehouse.address.state,
                          warehouse.address.country,
                        ]
                          .filter(Boolean)
                          .join(', ')}
                      </span>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex justify-end gap-2 pt-4 border-t">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setEditingWarehouse(warehouse);
                        setShowModal(true);
                      }}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(warehouse.id)}>
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="py-12 text-center">
              <Warehouse className="h-12 w-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400">No warehouses found</p>
              <Button
                className="mt-4"
                onClick={() => {
                  setEditingWarehouse(null);
                  setShowModal(true);
                }}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Warehouse
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Warehouse Modal */}
        {showModal && (
          <WarehouseModal
            warehouse={editingWarehouse}
            onClose={() => setShowModal(false)}
            onSave={() => {
              setShowModal(false);
              loadWarehouses();
            }}
          />
        )}
      </div>
    </div>
  );
}

function WarehouseModal({
  warehouse,
  onClose,
  onSave }: {
  warehouse: WarehouseItem | null;
  onClose: () => void;
  onSave: () => void;
}) {
  const [formData, setFormData] = useState({
    code: warehouse?.code || '',
    name: warehouse?.name || '',
    description: warehouse?.description || '',
    phone: warehouse?.phone || '',
    email: warehouse?.email || '',
    address: {
      street: warehouse?.address?.street || '',
      city: warehouse?.address?.city || '',
      state: warehouse?.address?.state || '',
      country: warehouse?.address?.country || '',
      postalCode: warehouse?.address?.postalCode || '' },
    totalCapacity: warehouse?.totalCapacity || 0,
    capacityUnit: warehouse?.capacityUnit || 'cubic_meters',
    isDefault: warehouse?.isDefault || false });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const data = {
        ...formData,
        address: Object.values(formData.address).some((v) => v) ? formData.address : undefined,
        totalCapacity: formData.totalCapacity || undefined };

      if (warehouse) {
        await inventoryApi.updateWarehouse(warehouse.id, data);
      } else {
        await inventoryApi.createWarehouse(data);
      }
      onSave();
    } catch (err: any) {
      setError((axios.isAxiosError(err) && err.response?.data?.error)?.message || 'Failed to save warehouse');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl w-full max-w-lg mx-4 max-h-[90vh] overflow-auto">
        <div className="p-6 border-b">
          <h2 className="text-xl font-semibold">
            {warehouse ? 'Edit Warehouse' : 'Add New Warehouse'}
          </h2>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && <div className="p-3 bg-red-50 text-red-700 rounded-lg text-sm">{error}</div>}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Code *</label>
              <Input
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                required
                placeholder="e.g., WH-001"
                className="font-mono"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Name *</label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                placeholder="Main Warehouse"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg text-sm"
              rows={2}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Phone</label>
              <Input
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+1 234 567 890"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="warehouse@example.com"
              />
            </div>
          </div>

          <div className="pt-2">
            <p className="text-sm font-medium mb-2">Address</p>
            <div className="space-y-3">
              <Input
                value={formData.address.street}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    address: { ...formData.address, street: e.target.value } })
                }
                placeholder="Street address"
              />
              <div className="grid grid-cols-2 gap-3">
                <Input
                  value={formData.address.city}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      address: { ...formData.address, city: e.target.value } })
                  }
                  placeholder="City"
                />
                <Input
                  value={formData.address.state}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      address: { ...formData.address, state: e.target.value } })
                  }
                  placeholder="State/Province"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Input
                  value={formData.address.country}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      address: { ...formData.address, country: e.target.value } })
                  }
                  placeholder="Country"
                />
                <Input
                  value={formData.address.postalCode}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      address: { ...formData.address, postalCode: e.target.value } })
                  }
                  placeholder="Postal Code"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Total Capacity</label>
              <Input
                type="number"
                min="0"
                value={formData.totalCapacity}
                onChange={(e) =>
                  setFormData({ ...formData, totalCapacity: parseFloat(e.target.value) || 0 })
                }
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Capacity Unit</label>
              <select
                value={formData.capacityUnit}
                onChange={(e) => setFormData({ ...formData, capacityUnit: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
              >
                <option value="cubic_meters">Cubic Meters</option>
                <option value="cubic_feet">Cubic Feet</option>
                <option value="pallets">Pallets</option>
                <option value="units">Units</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isDefault"
              checked={formData.isDefault}
              onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
              className="rounded"
            />
            <label htmlFor="isDefault" className="text-sm">
              Set as default warehouse
            </label>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : warehouse ? 'Update Warehouse' : 'Create Warehouse'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
