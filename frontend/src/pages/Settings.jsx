// src/pages/Settings.jsx
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Settings as SettingsIcon, Building2, AlertTriangle, Save, Loader2 } from 'lucide-react';
import { toast } from 'react-toastify';
import api from '../api';

export default function Settings({ onUserUpdate }) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors }
  } = useForm({
    defaultValues: {
      name: '',
      defaultThreshold: 10
    }
  });

  const fetchSettings = async () => {
    try {
      const response = await api.get('/settings');
      setValue('name', response.data.name);
      setValue('defaultThreshold', response.data.defaultThreshold);
    } catch (err) {
      console.error('Failed to load settings:', err);
      toast.error('Failed to load organization settings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const onSubmit = async (data) => {
    setSaving(true);
    try {
      const response = await api.put('/settings', {
        name: data.name,
        defaultThreshold: data.defaultThreshold
      });
      
      // Update local storage and global state to reflect the new org name
      const storedUser = JSON.parse(localStorage.getItem('stockflow_user') || '{}');
      const updatedUser = {
        ...storedUser,
        organizationName: response.data.name
      };
      localStorage.setItem('stockflow_user', JSON.stringify(updatedUser));
      onUserUpdate(updatedUser);

      toast.success(response.data.message || 'Settings updated successfully!');
    } catch (err) {
      console.error('Failed to save settings:', err);
      const errMsg = err.response?.data?.error || 'Failed to update settings';
      toast.error(errMsg);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full w-full">
        <Loader2 className="animate-spin text-indigo-500" size={36} />
      </div>
    );
  }

  return (
    <div className="p-6 overflow-y-auto h-full w-full max-w-2xl mx-auto space-y-6">
      <div className="rounded-2xl glass border border-slate-800 p-6 shadow-xl relative overflow-hidden">
        <div className="absolute -top-32 -left-32 w-64 h-64 rounded-full bg-indigo-500/5 blur-3xl"></div>
        
        <div className="flex items-center gap-3 pb-4 border-b border-slate-800/80">
          <div className="p-2 bg-indigo-500/10 rounded-xl text-indigo-400">
            <SettingsIcon size={20} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">Organization Profile</h2>
            <p className="text-slate-400 text-xs mt-0.5">Manage details and default stock limit parameters.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-6">
          {/* Org Name */}
          <div className="form-group">
            <label className="form-label">
              Organization Name
            </label>
            <div className="input-wrapper">
              <Building2 className="input-icon" size={16} />
              <input
                type="text"
                placeholder="e.g. Acme Corp"
                className="form-input has-icon"
                {...register('name', { required: 'Organization name is required' })}
              />
            </div>
            {errors.name && (
              <span className="text-[11px] text-red-400 font-medium block">
                {errors.name.message}
              </span>
            )}
          </div>

          {/* Default Threshold */}
          <div className="form-group">
            <label className="form-label">
              Default Low Stock Threshold Limit
            </label>
            <div className="input-wrapper">
              <AlertTriangle className="input-icon" size={16} />
              <input
                type="number"
                placeholder="10"
                className="form-input has-icon"
                {...register('defaultThreshold', {
                  required: 'Default threshold limit is required',
                  min: { value: 0, message: 'Threshold limit cannot be negative' }
                })}
              />
            </div>
            <p className="text-[11px] text-slate-500 mt-1 font-medium leading-relaxed">
              If an individual product doesn't have a customized low-stock threshold, this value will be used dynamically on the dashboard to calculate stock warning states.
            </p>
            {errors.defaultThreshold && (
              <span className="text-[11px] text-red-400 font-medium block">
                {errors.defaultThreshold.message}
              </span>
            )}
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={saving}
            className="btn-primary mt-4"
          >
            {saving ? (
              <Loader2 className="animate-spin text-white" size={16} />
            ) : (
              <>
                <Save size={16} />
                <span>Save Organization Settings</span>
              </>
            )}
          </button>
        </form>
      </div>

      <div className="p-4 rounded-xl bg-slate-950/40 border border-slate-900 text-xs text-slate-500 font-medium leading-relaxed">
        <h4 className="text-slate-400 font-semibold mb-1">Row Level Security Notice:</h4>
        All changes to settings are restricted exclusively to users within your organization. Inter-tenant database references are strictly separated at the database API level.
      </div>
    </div>
  );
}
