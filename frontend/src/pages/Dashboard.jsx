// src/pages/Dashboard.jsx
import React, { useState, useEffect } from 'react';
import { 
  Boxes, 
  Warehouse, 
  AlertTriangle, 
  ArrowRightLeft, 
  TrendingUp, 
  Loader2 
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../api';

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    try {
      const response = await api.get('/dashboard');
      setData(response.data);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
      toast.error('Failed to fetch dashboard metrics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full w-full">
        <Loader2 className="animate-spin text-indigo-500" size={36} />
      </div>
    );
  }

  const kpis = [
    {
      title: 'Total Products',
      value: data?.totalProducts || 0,
      description: 'Unique catalog SKUs',
      icon: Boxes,
      glow: 'shadow-indigo-500/10 border-indigo-500/20',
      iconBg: 'bg-indigo-500/10 text-indigo-400',
    },
    {
      title: 'Total Inventory Units',
      value: data?.totalInventoryUnits || 0,
      description: 'In-stock aggregate items',
      icon: Warehouse,
      glow: 'shadow-cyan-500/10 border-cyan-500/20',
      iconBg: 'bg-cyan-500/10 text-cyan-400',
    },
    {
      title: 'Low Stock Items',
      value: data?.lowStockCount || 0,
      description: 'Items below threshold limit',
      icon: AlertTriangle,
      glow: data?.lowStockCount > 0 ? 'shadow-red-500/20 border-red-500/30' : 'shadow-emerald-500/10 border-emerald-500/20',
      iconBg: data?.lowStockCount > 0 ? 'bg-red-500/10 text-red-400' : 'bg-emerald-500/10 text-emerald-400',
      badgeColor: data?.lowStockCount > 0 ? 'text-red-400 bg-red-500/10 border border-red-500/20' : 'text-emerald-400 bg-emerald-500/10 border border-emerald-500/20',
    },
  ];

  return (
    <div className="p-6 space-y-8 overflow-y-auto h-full w-full max-w-7xl mx-auto">
      {/* Welcome Banner */}
      <div className="p-6 rounded-2xl glass border border-slate-800 flex items-center justify-between relative overflow-hidden">
        <div className="absolute -top-32 -right-32 w-64 h-64 rounded-full bg-indigo-500/10 blur-3xl"></div>
        <div className="space-y-1 z-10">
          <h2 className="text-2xl font-bold text-white tracking-tight">StockFlow Workspace Status</h2>
          <p className="text-slate-400 text-sm">Review aggregate metrics and handle restocking alerts from a single multi-tenant dashboard.</p>
        </div>
        <TrendingUp className="text-indigo-500/20 w-16 h-16 mr-4 hidden md:block" />
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {kpis.map((kpi, idx) => {
          const Icon = kpi.icon;
          return (
            <div 
              key={idx} 
              className={`p-6 rounded-2xl glass border shadow-xl flex flex-col justify-between h-44 hover:translate-y-[-2px] transition-all duration-300 ${kpi.glow}`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider">{kpi.title}</p>
                  <h3 className="text-4xl font-extrabold text-white mt-2 tracking-tight">
                    {kpi.value.toLocaleString()}
                  </h3>
                </div>
                <div className={`p-3 rounded-xl ${kpi.iconBg}`}>
                  <Icon size={22} />
                </div>
              </div>
              <p className="text-slate-500 text-xs flex items-center gap-1.5 font-medium mt-4">
                {kpi.title === 'Low Stock Items' && data?.lowStockCount > 0 ? (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-red-500/10 text-red-400 border border-red-500/20">
                    Needs Attention
                  </span>
                ) : kpi.title === 'Low Stock Items' ? (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    All Healthy
                  </span>
                ) : null}
                <span>{kpi.description}</span>
              </p>
            </div>
          );
        })}
      </div>

      {/* Low Stock Warning Table & Links */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Table list - takes 2 cols on lg, 1 on md */}
        <div className="lg:col-span-2 rounded-2xl glass border border-slate-800 p-6 flex flex-col justify-between min-h-[350px]">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-slate-800/80">
              <div className="flex items-center gap-2">
                <AlertTriangle className="text-red-400" size={18} />
                <h3 className="text-base font-semibold text-white">Low Stock Warning Indicators</h3>
              </div>
              <span className="text-xs font-medium text-slate-400 bg-slate-900 border border-slate-800 px-2.5 py-1 rounded-full">
                {data?.lowStockCount || 0} alerts active
              </span>
            </div>

            {/* List */}
            {data?.lowStockAlerts && data.lowStockAlerts.length > 0 ? (
              <div className="mt-4 overflow-x-auto">
                <table className="w-full text-left text-sm border-collapse">
                  <thead>
                    <tr className="text-slate-500 text-xs uppercase font-semibold border-b border-slate-800/50">
                      <th className="py-2.5">Product Name</th>
                      <th className="py-2.5">SKU</th>
                      <th className="py-2.5 text-center">In Stock</th>
                      <th className="py-2.5 text-center">Alert Limit</th>
                      <th className="py-2.5 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/40 text-slate-300">
                    {data.lowStockAlerts.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-900/10 transition-colors">
                        <td className="py-3 font-semibold text-white">{item.name}</td>
                        <td className="py-3 font-mono text-xs text-indigo-300">{item.sku}</td>
                        <td className="py-3 text-center font-bold">{item.quantity}</td>
                        <td className="py-3 text-center text-slate-400">{item.threshold}</td>
                        <td className="py-3 text-right">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            item.quantity === 0 
                              ? 'bg-red-500/20 text-red-400 border border-red-500/30' 
                              : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                          }`}>
                            {item.quantity === 0 ? 'OUT OF STOCK' : 'LOW STOCK'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 text-slate-500 gap-2">
                <Warehouse size={40} className="text-slate-700" />
                <p className="text-sm font-medium">All products are healthy and above low-stock thresholds!</p>
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-slate-800/60 mt-4 flex justify-end">
            <Link 
              to="/products" 
              className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1.5 transition-colors"
            >
              <span>Manage Products Catalog</span>
              <ArrowRightLeft size={12} />
            </Link>
          </div>
        </div>

        {/* Organization Information Card */}
        <div className="rounded-2xl glass border border-slate-800 p-6 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="pb-4 border-b border-slate-800">
              <h3 className="text-base font-semibold text-white">Workspace Details</h3>
            </div>
            
            <div className="space-y-3.5 mt-2">
              <div className="space-y-1">
                <span className="text-[10px] uppercase font-semibold text-slate-500 tracking-wider">Default Threshold</span>
                <p className="text-sm font-medium text-slate-200">
                  {data?.defaultThreshold || 10} units (global setting)
                </p>
              </div>
              
              <div className="space-y-1">
                <span className="text-[10px] uppercase font-semibold text-slate-500 tracking-wider">Storage Engine</span>
                <p className="text-sm font-medium text-indigo-300 font-mono">
                  SQLite File DB (local mode)
                </p>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] uppercase font-semibold text-slate-500 tracking-wider">Tenant Isolation Scope</span>
                <p className="text-xs leading-relaxed text-slate-400 font-medium bg-indigo-500/5 border border-indigo-500/10 p-2.5 rounded-xl">
                  Row level parameters ensure only active organization users have access to these product statistics.
                </p>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800 mt-6">
            <Link 
              to="/settings"
              className="w-full text-center bg-slate-900 border border-slate-800 hover:bg-slate-800/80 text-white font-medium rounded-xl py-2.5 px-4 text-xs block transition-all"
            >
              Configure Thresholds
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
