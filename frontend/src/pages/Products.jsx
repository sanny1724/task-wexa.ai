// src/pages/Products.jsx
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { 
  Boxes, 
  Search, 
  Plus, 
  Edit3, 
  Trash2, 
  X, 
  Loader2, 
  AlertTriangle,
  Info
} from 'lucide-react';
import { toast } from 'react-toastify';
import api from '../api';

export default function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modals state
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingProduct, setDeletingProduct] = useState(null);
  
  const [formLoading, setFormLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Form hooks
  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors }
  } = useForm();

  // Load products list
  const fetchProducts = async (query = '') => {
    setLoading(true);
    try {
      let url = '/products';
      if (query.trim()) {
        url = `/products/search?q=${encodeURIComponent(query.trim())}`;
      }
      const response = await api.get(url);
      setProducts(response.data);
    } catch (err) {
      console.error('Failed to fetch products:', err);
      toast.error('Failed to load products list');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts(searchQuery);
  }, [searchQuery]);

  // Handle Search Input Change
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  // Open modal for Create Product
  const openCreateModal = () => {
    setEditingProduct(null);
    reset({
      name: '',
      sku: '',
      description: '',
      quantity: 0,
      costPrice: 0,
      sellingPrice: 0,
      lowStockThreshold: ''
    });
    setShowFormModal(true);
  };

  // Open modal for Edit Product
  const openEditModal = (product) => {
    setEditingProduct(product);
    reset({
      name: product.name,
      sku: product.sku,
      description: product.description || '',
      quantity: product.quantity,
      costPrice: product.costPrice,
      sellingPrice: product.sellingPrice,
      lowStockThreshold: product.lowStockThreshold !== null ? product.lowStockThreshold : ''
    });
    setShowFormModal(true);
  };

  // Form Submit Handler (Add or Update)
  const onFormSubmit = async (data) => {
    setFormLoading(true);
    try {
      const payload = {
        name: data.name,
        sku: data.sku,
        description: data.description,
        quantity: Number(data.quantity),
        costPrice: Number(data.costPrice),
        sellingPrice: Number(data.sellingPrice),
        lowStockThreshold: data.lowStockThreshold !== '' ? Number(data.lowStockThreshold) : null
      };

      if (editingProduct) {
        // PUT Request
        const response = await api.put(`/products/${editingProduct.id}`, payload);
        toast.success(`Product "${response.data.name}" updated successfully!`);
      } else {
        // POST Request
        const response = await api.post('/products', payload);
        toast.success(`Product "${response.data.name}" added to catalog!`);
      }
      
      setShowFormModal(false);
      fetchProducts(searchQuery);
    } catch (err) {
      console.error('Failed to save product:', err);
      const errMsg = err.response?.data?.error || 'Failed to save product details.';
      toast.error(errMsg);
    } finally {
      setFormLoading(false);
    }
  };

  // Open Delete Confirmation Modal
  const openDeleteModal = (product) => {
    setDeletingProduct(product);
    setShowDeleteModal(true);
  };

  // Handle Delete Confirmation
  const handleDeleteConfirm = async () => {
    if (!deletingProduct) return;
    setDeleteLoading(true);
    try {
      await api.delete(`/products/${deletingProduct.id}`);
      toast.success(`Product "${deletingProduct.name}" removed from catalog.`);
      setShowDeleteModal(false);
      fetchProducts(searchQuery);
    } catch (err) {
      console.error('Failed to delete product:', err);
      const errMsg = err.response?.data?.error || 'Failed to delete product.';
      toast.error(errMsg);
    } finally {
      setDeleteLoading(false);
      setDeletingProduct(null);
    }
  };

  return (
    <div className="p-6 overflow-hidden flex flex-col h-full w-full max-w-7xl mx-auto space-y-6">
      
      {/* Top action bar: Search & Add button */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-900/40 border border-slate-800/80 p-4 rounded-2xl glass">
        <div className="input-wrapper w-full sm:max-w-md">
          <Search className="input-icon" size={16} />
          <input
            type="text"
            placeholder="Search products by name or SKU..."
            value={searchQuery}
            onChange={handleSearchChange}
            className="form-input has-icon"
          />
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
              style={{ zIndex: 20 }}
            >
              <X size={14} />
            </button>
          )}
        </div>

        <button
          onClick={openCreateModal}
          className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl py-2.5 px-4 text-sm flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-[0.98]"
        >
          <Plus size={16} />
          <span>Add Product</span>
        </button>
      </div>

      {/* Main Table area */}
      <div className="flex-grow overflow-auto rounded-2xl border border-slate-800 glass shadow-xl min-h-[300px]">
        {loading && products.length === 0 ? (
          <div className="flex items-center justify-center h-full w-full">
            <Loader2 className="animate-spin text-indigo-500" size={32} />
          </div>
        ) : products.length > 0 ? (
          <table className="w-full text-left text-sm border-collapse min-w-[700px]">
            <thead>
              <tr className="bg-slate-900/60 border-b border-slate-800 text-slate-400 text-xs uppercase font-semibold">
                <th className="p-4">Product details</th>
                <th className="p-4">SKU Code</th>
                <th className="p-4 text-center">In Stock</th>
                <th className="p-4 text-right">Cost Price</th>
                <th className="p-4 text-right">Selling Price</th>
                <th className="p-4 text-center">Custom Limit</th>
                <th className="p-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/40 text-slate-300">
              {products.map((item) => (
                <tr key={item.id} className="hover:bg-slate-900/20 transition-colors">
                  <td className="p-4">
                    <div className="space-y-1">
                      <p className="font-bold text-white text-base leading-tight">{item.name}</p>
                      {item.description && (
                        <p className="text-xs text-slate-500 max-w-sm line-clamp-1" title={item.description}>
                          {item.description}
                        </p>
                      )}
                    </div>
                  </td>
                  <td className="p-4">
                    <span className="font-mono text-xs text-indigo-300 bg-indigo-500/5 border border-indigo-500/10 px-2 py-1 rounded-md">
                      {item.sku}
                    </span>
                  </td>
                  <td className="p-4 text-center">
                    <span className={`font-bold text-base ${item.quantity === 0 ? 'text-red-400' : 'text-white'}`}>
                      {item.quantity}
                    </span>
                  </td>
                  <td className="p-4 text-right font-medium">
                    ${item.costPrice.toFixed(2)}
                  </td>
                  <td className="p-4 text-right font-medium text-emerald-400">
                    ${item.sellingPrice.toFixed(2)}
                  </td>
                  <td className="p-4 text-center">
                    {item.lowStockThreshold !== null ? (
                      <span className="text-xs font-semibold text-slate-300 bg-slate-900 border border-slate-800/80 px-2.5 py-0.5 rounded-full">
                        {item.lowStockThreshold}
                      </span>
                    ) : (
                      <span className="text-xs text-slate-500 italic">Default</span>
                    )}
                  </td>
                  <td className="p-4">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => openEditModal(item)}
                        className="p-2 text-slate-400 hover:text-indigo-400 hover:bg-slate-800/50 rounded-lg transition-all"
                        title="Edit Item Details"
                      >
                        <Edit3 size={15} />
                      </button>
                      <button
                        onClick={() => openDeleteModal(item)}
                        className="p-2 text-slate-400 hover:text-red-400 hover:bg-slate-800/50 rounded-lg transition-all"
                        title="Delete Product"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="flex flex-col items-center justify-center h-full w-full py-24 text-slate-500 gap-3">
            <Boxes size={48} className="text-slate-800" />
            <div className="text-center space-y-1">
              <p className="text-base font-semibold text-slate-400">No products found</p>
              <p className="text-xs text-slate-600">Create a new item to get started on your inventory list.</p>
            </div>
          </div>
        )}
      </div>

      {/* --- ADD/EDIT MODAL --- */}
      {showFormModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="relative w-full max-w-lg rounded-2xl glass border border-slate-800 p-6 shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800/80">
              <h3 className="text-lg font-bold text-white tracking-tight">
                {editingProduct ? `Edit Product: ${editingProduct.name}` : 'Add New Product'}
              </h3>
              <button 
                onClick={() => setShowFormModal(false)}
                className="p-1 rounded-lg hover:bg-slate-900 text-slate-400 hover:text-white transition-all"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit(onFormSubmit)} className="py-4 overflow-y-auto pr-1">
              {/* Product Name */}
              <div className="form-group">
                <label className="form-label">Product Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Wireless Mouse"
                  className="form-input"
                  {...register('name', { required: 'Product name is required' })}
                />
                {errors.name && <span className="text-[10px] text-red-400 font-medium block">{errors.name.message}</span>}
              </div>

              {/* SKU */}
              <div className="form-group">
                <label className="form-label">SKU Code *</label>
                <input
                  type="text"
                  placeholder="e.g. MOUSE-WRLS-001"
                  className="form-input"
                  {...register('sku', { required: 'SKU code is required' })}
                />
                {errors.sku && <span className="text-[10px] text-red-400 font-medium block">{errors.sku.message}</span>}
              </div>

              {/* Description */}
              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea
                  placeholder="Product specification details..."
                  rows="2"
                  className="form-input resize-none"
                  {...register('description')}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Quantity */}
                <div className="form-group">
                  <label className="form-label">Quantity *</label>
                  <input
                    type="number"
                    placeholder="0"
                    className="form-input"
                    {...register('quantity', {
                      required: 'Quantity is required',
                      min: { value: 0, message: 'Quantity cannot be negative' }
                    })}
                  />
                  {errors.quantity && <span className="text-[10px] text-red-400 font-medium block">{errors.quantity.message}</span>}
                </div>

                {/* Low Stock Threshold Override */}
                <div className="form-group">
                  <label className="form-label">Low Stock Limit Override</label>
                  <input
                    type="number"
                    placeholder="Use Global Default"
                    className="form-input"
                    {...register('lowStockThreshold', {
                      min: { value: 0, message: 'Threshold limit cannot be negative' }
                    })}
                  />
                  {errors.lowStockThreshold && <span className="text-[10px] text-red-400 font-medium block">{errors.lowStockThreshold.message}</span>}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Cost Price */}
                <div className="form-group">
                  <label className="form-label">Cost Price ($) *</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    className="form-input"
                    {...register('costPrice', {
                      required: 'Cost price is required',
                      min: { value: 0, message: 'Price cannot be negative' }
                    })}
                  />
                  {errors.costPrice && <span className="text-[10px] text-red-400 font-medium block">{errors.costPrice.message}</span>}
                </div>

                {/* Selling Price */}
                <div className="form-group">
                  <label className="form-label">Selling Price ($) *</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    className="form-input"
                    {...register('sellingPrice', {
                      required: 'Selling price is required',
                      min: { value: 0, message: 'Price cannot be negative' }
                    })}
                  />
                  {errors.sellingPrice && <span className="text-[10px] text-red-400 font-medium block">{errors.sellingPrice.message}</span>}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800/80 flex items-center justify-end gap-3 mt-4">
                <button
                  type="button"
                  onClick={() => setShowFormModal(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-800 text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-900 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formLoading}
                  className="btn-primary"
                  style={{ width: 'auto', padding: '10px 20px' }}
                >
                  {formLoading && <Loader2 className="animate-spin" size={14} />}
                  <span>{editingProduct ? 'Update Product' : 'Add to Catalog'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- DELETE CONFIRMATION MODAL (Custom Premium) --- */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-md rounded-2xl glass border border-red-500/20 p-6 shadow-2xl flex flex-col">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400">
                <AlertTriangle size={24} />
              </div>
              <div className="space-y-1.5 text-left flex-grow">
                <h3 className="text-lg font-bold text-white tracking-tight">Confirm Deletion</h3>
                <p className="text-slate-400 text-xs leading-relaxed">
                  Are you sure you want to delete <span className="font-semibold text-white">"{deletingProduct?.name}"</span>? 
                  This will permanently remove the item and all its inventory records from your catalog.
                </p>
                <div className="p-3 bg-slate-950/40 border border-slate-800 rounded-xl flex items-center gap-2 mt-3 text-[11px] text-slate-500 font-medium">
                  <Info size={14} className="text-indigo-400 shrink-0" />
                  <span>SKU reference: <span className="font-mono text-indigo-300">{deletingProduct?.sku}</span></span>
                </div>
              </div>
            </div>

            <div className="pt-6 mt-6 border-t border-slate-800/80 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2.5 rounded-xl border border-slate-800 text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-900 transition-colors"
                disabled={deleteLoading}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirm}
                className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 active:bg-red-700 text-xs font-semibold text-white flex items-center gap-1.5 transition-all active:scale-[0.98] disabled:opacity-60"
                disabled={deleteLoading}
              >
                {deleteLoading && <Loader2 className="animate-spin" size={14} />}
                <span>Delete Product</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
