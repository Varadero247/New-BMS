'use client';

import { useState } from 'react';
import {
  LayoutDashboard, FileText, ShoppingCart, MessageSquare, Clock,
  CheckCircle, AlertTriangle, Search, Download, Eye, ChevronRight
} from 'lucide-react';

interface Ticket {
  id: string;
  subject: string;
  status: 'open' | 'in-progress' | 'resolved' | 'closed';
  priority: 'high' | 'medium' | 'low';
  created: string;
  lastUpdate: string;
  category: string;
}

interface Order {
  id: string;
  orderNumber: string;
  description: string;
  status: 'pending' | 'confirmed' | 'in-production' | 'shipped' | 'delivered';
  total: number;
  orderDate: string;
  expectedDelivery: string;
  items: number;
}

interface Document {
  id: string;
  name: string;
  type: string;
  size: string;
  uploadDate: string;
}

const tickets: Ticket[] = [
  { id: 't1', subject: 'Quality certificate request for batch QC-2602-089', status: 'in-progress', priority: 'medium', created: '2026-02-10', lastUpdate: '2026-02-12', category: 'Quality' },
  { id: 't2', subject: 'Delivery delay on PO-2602-0045', status: 'open', priority: 'high', created: '2026-02-12', lastUpdate: '2026-02-12', category: 'Logistics' },
  { id: 't3', subject: 'Request for updated MSDS — Product XR-450', status: 'resolved', priority: 'low', created: '2026-02-05', lastUpdate: '2026-02-08', category: 'Technical' },
  { id: 't4', subject: 'Invoice discrepancy — INV-2602-0234', status: 'open', priority: 'high', created: '2026-02-11', lastUpdate: '2026-02-13', category: 'Finance' },
  { id: 't5', subject: 'Annual contract renewal discussion', status: 'closed', priority: 'medium', created: '2026-01-15', lastUpdate: '2026-01-30', category: 'Commercial' },
];

const orders: Order[] = [
  { id: 'o1', orderNumber: 'PO-2602-0045', description: 'CardioMonitor Pro X3 — 50 units', status: 'in-production', total: 125000, orderDate: '2026-01-28', expectedDelivery: '2026-03-15', items: 50 },
  { id: 'o2', orderNumber: 'PO-2602-0052', description: 'Replacement sensor modules — 200 units', status: 'shipped', total: 24000, orderDate: '2026-02-05', expectedDelivery: '2026-02-14', items: 200 },
  { id: 'o3', orderNumber: 'PO-2602-0038', description: 'Custom enclosure assembly — 30 units', status: 'delivered', total: 45000, orderDate: '2026-01-10', expectedDelivery: '2026-02-01', items: 30 },
  { id: 'o4', orderNumber: 'PO-2602-0060', description: 'Calibration standards kit — 5 units', status: 'confirmed', total: 8500, orderDate: '2026-02-12', expectedDelivery: '2026-02-28', items: 5 },
];

const documents: Document[] = [
  { id: 'doc1', name: 'Quality Certificate — QC-2602-089', type: 'Certificate', size: '245 KB', uploadDate: '2026-02-08' },
  { id: 'doc2', name: 'Product Specification — CardioMonitor Pro X3', type: 'Specification', size: '1.2 MB', uploadDate: '2026-01-15' },
  { id: 'doc3', name: 'Statement of Account — January 2026', type: 'Financial', size: '89 KB', uploadDate: '2026-02-01' },
  { id: 'doc4', name: 'MSDS — Product XR-450', type: 'Safety', size: '156 KB', uploadDate: '2026-02-08' },
  { id: 'doc5', name: 'Terms & Conditions 2026', type: 'Legal', size: '320 KB', uploadDate: '2025-12-20' },
];

const ticketStatus: Record<string, { label: string; color: string }> = {
  open: { label: 'Open', color: 'bg-blue-100 text-blue-700' },
  'in-progress': { label: 'In Progress', color: 'bg-amber-100 text-amber-700' },
  resolved: { label: 'Resolved', color: 'bg-green-100 text-green-700' },
  closed: { label: 'Closed', color: 'bg-gray-100 dark:bg-gray-800 text-gray-600' },
};

const orderStatus: Record<string, { label: string; color: string; step: number }> = {
  pending: { label: 'Pending', color: 'bg-gray-100 dark:bg-gray-800 text-gray-600', step: 1 },
  confirmed: { label: 'Confirmed', color: 'bg-blue-100 text-blue-700', step: 2 },
  'in-production': { label: 'In Production', color: 'bg-amber-100 text-amber-700', step: 3 },
  shipped: { label: 'Shipped', color: 'bg-purple-100 text-purple-700', step: 4 },
  delivered: { label: 'Delivered', color: 'bg-green-100 text-green-700', step: 5 },
};

type Tab = 'overview' | 'tickets' | 'orders' | 'documents';

export default function SelfServiceClient() {
  const [activeTab, setActiveTab] = useState<Tab>('overview');

  const openTickets = tickets.filter((t) => t.status === 'open' || t.status === 'in-progress').length;
  const activeOrders = orders.filter((o) => o.status !== 'delivered').length;
  const totalOrderValue = orders.reduce((s, o) => s + o.total, 0);

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: 'overview', label: 'Overview', icon: <LayoutDashboard className="h-4 w-4" /> },
    { id: 'tickets', label: 'Support Tickets', icon: <MessageSquare className="h-4 w-4" /> },
    { id: 'orders', label: 'Orders', icon: <ShoppingCart className="h-4 w-4" /> },
    { id: 'documents', label: 'Documents', icon: <FileText className="h-4 w-4" /> },
  ];

  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Customer Self-Service</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Welcome back — manage your orders, tickets, and documents</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
        {tabs.map((tab) => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === tab.id ? 'bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700'}`}>
            {tab.icon}{tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-4">
              <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-medium">Open Tickets</p>
              <p className="text-3xl font-bold text-blue-700 mt-1">{openTickets}</p>
            </div>
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-4">
              <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-medium">Active Orders</p>
              <p className="text-3xl font-bold text-amber-700 mt-1">{activeOrders}</p>
            </div>
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-4">
              <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-medium">Order Value</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-gray-100 mt-1">£{(totalOrderValue / 1000).toFixed(0)}k</p>
            </div>
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-4">
              <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-medium">Documents</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-gray-100 mt-1">{documents.length}</p>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-4">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Recent Tickets</h3>
              <div className="space-y-2">
                {tickets.slice(0, 3).map((t) => (
                  <div key={t.id} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100 line-clamp-1">{t.subject}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{t.created}</p>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${ticketStatus[t.status].color}`}>{ticketStatus[t.status].label}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-4">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Active Orders</h3>
              <div className="space-y-2">
                {orders.filter((o) => o.status !== 'delivered').map((o) => (
                  <div key={o.id} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{o.orderNumber}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">£{o.total.toLocaleString()} · Due {o.expectedDelivery}</p>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${orderStatus[o.status].color}`}>{orderStatus[o.status].label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'tickets' && (
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-500 dark:text-gray-400">Subject</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500 dark:text-gray-400 w-24">Category</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500 dark:text-gray-400 w-24">Priority</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500 dark:text-gray-400 w-28">Status</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500 dark:text-gray-400 w-28">Last Update</th>
              </tr>
            </thead>
            <tbody>
              {tickets.map((t) => (
                <tr key={t.id} className="border-t border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:bg-gray-800">
                  <td className="px-4 py-3 font-medium text-gray-900 dark:text-gray-100">{t.subject}</td>
                  <td className="px-4 py-3 text-gray-600 text-xs">{t.category}</td>
                  <td className="px-4 py-3"><span className={`px-2 py-0.5 rounded-full text-xs font-medium ${t.priority === 'high' ? 'bg-red-100 text-red-700' : t.priority === 'medium' ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 dark:bg-gray-800 text-gray-600'}`}>{t.priority}</span></td>
                  <td className="px-4 py-3"><span className={`px-2 py-0.5 rounded-full text-xs font-medium ${ticketStatus[t.status].color}`}>{ticketStatus[t.status].label}</span></td>
                  <td className="px-4 py-3 text-xs text-gray-500 dark:text-gray-400">{t.lastUpdate}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'orders' && (
        <div className="space-y-4">
          {orders.map((o) => {
            const step = orderStatus[o.status].step;
            return (
              <div key={o.id} className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-gray-900 dark:text-gray-100">{o.orderNumber}</p>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${orderStatus[o.status].color}`}>{orderStatus[o.status].label}</span>
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{o.description}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-gray-900 dark:text-gray-100">£{o.total.toLocaleString()}</p>
                    <p className="text-xs text-gray-400 dark:text-gray-500">{o.items} items</p>
                  </div>
                </div>
                {/* Progress Steps */}
                <div className="flex items-center gap-1">
                  {['Pending', 'Confirmed', 'In Production', 'Shipped', 'Delivered'].map((s, i) => (
                    <div key={s} className="flex-1">
                      <div className={`h-2 rounded-full ${i + 1 <= step ? 'bg-blue-500' : 'bg-gray-200'}`} />
                      <p className="text-xs text-gray-400 dark:text-gray-500 mt-1 text-center">{s}</p>
                    </div>
                  ))}
                </div>
                <div className="flex items-center gap-4 mt-2 text-xs text-gray-500 dark:text-gray-400">
                  <span>Ordered: {o.orderDate}</span>
                  <span>Expected: {o.expectedDelivery}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {activeTab === 'documents' && (
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-500 dark:text-gray-400">Document</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500 dark:text-gray-400 w-24">Type</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500 dark:text-gray-400 w-20">Size</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500 dark:text-gray-400 w-28">Date</th>
                <th className="text-center px-4 py-3 font-medium text-gray-500 dark:text-gray-400 w-20">Action</th>
              </tr>
            </thead>
            <tbody>
              {documents.map((d) => (
                <tr key={d.id} className="border-t border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:bg-gray-800">
                  <td className="px-4 py-3"><div className="flex items-center gap-2"><FileText className="h-4 w-4 text-blue-500" /><span className="font-medium text-gray-900 dark:text-gray-100">{d.name}</span></div></td>
                  <td className="px-4 py-3 text-xs text-gray-500 dark:text-gray-400">{d.type}</td>
                  <td className="px-4 py-3 text-xs text-gray-500 dark:text-gray-400">{d.size}</td>
                  <td className="px-4 py-3 text-xs text-gray-500 dark:text-gray-400">{d.uploadDate}</td>
                  <td className="px-4 py-3 text-center">
                    <button className="p-1.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100"><Download className="h-4 w-4" /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
