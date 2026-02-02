import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export const api = axios.create({
  baseURL: `${API_URL}/api/inventory`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        window.location.href = 'http://localhost:3000/login';
      }
    }
    return Promise.reject(error);
  }
);

// Helper functions for API calls
export const inventoryApi = {
  // Products
  getProducts: (params?: Record<string, any>) => api.get('/products', { params }),
  getProduct: (id: string) => api.get(`/products/${id}`),
  searchProduct: (query: string) => api.get('/products/search', { params: { q: query } }),
  getLowStockProducts: () => api.get('/products/low-stock'),
  createProduct: (data: any) => api.post('/products', data),
  updateProduct: (id: string, data: any) => api.patch(`/products/${id}`, data),
  deleteProduct: (id: string) => api.delete(`/products/${id}`),

  // Inventory
  getInventory: (params?: Record<string, any>) => api.get('/inventory', { params }),
  getInventorySummary: (warehouseId?: string) => api.get('/inventory/summary', { params: { warehouseId } }),
  getAvailability: (productId: string) => api.get(`/inventory/availability/${productId}`),
  adjustStock: (data: any) => api.post('/inventory/adjust', data),
  transferStock: (data: any) => api.post('/inventory/transfer', data),
  receiveGoods: (data: any) => api.post('/inventory/receive', data),
  issueGoods: (data: any) => api.post('/inventory/issue', data),

  // Transactions
  getTransactions: (params?: Record<string, any>) => api.get('/transactions', { params }),
  getTransactionSummary: (params?: Record<string, any>) => api.get('/transactions/summary', { params }),
  getProductTransactions: (productId: string, params?: Record<string, any>) =>
    api.get(`/transactions/product/${productId}`, { params }),

  // Warehouses
  getWarehouses: (params?: Record<string, any>) => api.get('/warehouses', { params }),
  getWarehouse: (id: string) => api.get(`/warehouses/${id}`),
  getWarehouseInventory: (id: string, params?: Record<string, any>) =>
    api.get(`/warehouses/${id}/inventory`, { params }),
  createWarehouse: (data: any) => api.post('/warehouses', data),
  updateWarehouse: (id: string, data: any) => api.patch(`/warehouses/${id}`, data),
  deleteWarehouse: (id: string) => api.delete(`/warehouses/${id}`),

  // Categories
  getCategories: (params?: Record<string, any>) => api.get('/categories', { params }),
  getCategory: (id: string) => api.get(`/categories/${id}`),
  createCategory: (data: any) => api.post('/categories', data),
  updateCategory: (id: string, data: any) => api.patch(`/categories/${id}`, data),
  deleteCategory: (id: string) => api.delete(`/categories/${id}`),

  // Suppliers
  getSuppliers: (params?: Record<string, any>) => api.get('/suppliers', { params }),
  getSupplier: (id: string) => api.get(`/suppliers/${id}`),
  createSupplier: (data: any) => api.post('/suppliers', data),
  updateSupplier: (id: string, data: any) => api.patch(`/suppliers/${id}`, data),
  deleteSupplier: (id: string) => api.delete(`/suppliers/${id}`),
};
