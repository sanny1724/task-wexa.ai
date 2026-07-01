// src/pages/Login.jsx
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { Boxes, Mail, Lock, Building2, ChevronRight, Loader2 } from 'lucide-react';
import { toast } from 'react-toastify';
import api from '../api';

export default function Login({ onLoginSuccess }) {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const { 
    register, 
    handleSubmit, 
    reset,
    formState: { errors } 
  } = useForm({
    defaultValues: {
      email: '',
      password: '',
      organizationName: ''
    }
  });

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      if (isLogin) {
        // Sign In Flow
        const response = await api.post('/auth/login', {
          email: data.email,
          password: data.password
        });
        
        const { token, user } = response.data;
        localStorage.setItem('stockflow_token', token);
        localStorage.setItem('stockflow_user', JSON.stringify(user));
        
        onLoginSuccess(user, token);
        toast.success(`Welcome back, ${user.email}!`);
        navigate('/dashboard');
      } else {
        // Sign Up Flow
        const response = await api.post('/auth/signup', {
          email: data.email,
          password: data.password,
          organizationName: data.organizationName
        });
        
        const { token, user } = response.data;
        localStorage.setItem('stockflow_token', token);
        localStorage.setItem('stockflow_user', JSON.stringify(user));
        
        onLoginSuccess(user, token);
        toast.success(`Organization "${user.organizationName}" registered successfully!`);
        navigate('/dashboard');
      }
    } catch (err) {
      console.error('Authentication error:', err);
      const errMsg = err.response?.data?.error || 'Authentication failed. Please try again.';
      toast.error(errMsg);
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    reset();
  };

  return (
    <div className="auth-page">
      <div className="auth-card glass max-w-md w-full mx-4 shadow-2xl relative overflow-hidden">
        {/* Glow Effects */}
        <div className="absolute -top-24 -left-24 w-48 h-48 rounded-full bg-indigo-500/20 blur-3xl"></div>
        <div className="absolute -bottom-24 -right-24 w-48 h-48 rounded-full bg-cyan-500/20 blur-3xl"></div>

        <div className="auth-logo mx-auto">
          <Boxes size={32} color="#fff" />
        </div>

        <h2 className="auth-title text-3xl font-extrabold tracking-tight bg-gradient-to-r from-white to-indigo-200 bg-clip-text text-transparent">
          {isLogin ? 'Welcome to StockFlow' : 'Create an Account'}
        </h2>
        <p className="auth-subtitle mt-2 text-sm text-slate-400">
          {isLogin 
            ? 'Access your unified SaaS multi-tenant inventory workspace.' 
            : 'Register a new tenant organization to begin managing inventory.'}
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="w-full text-left mt-6">
          {/* Organization Name Field (Signup Only) */}
          {!isLogin && (
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
                  {...register('organizationName', { 
                    required: !isLogin ? 'Organization name is required' : false 
                  })}
                />
              </div>
              {errors.organizationName && (
                <span className="text-[11px] text-red-400 font-medium block">
                  {errors.organizationName.message}
                </span>
              )}
            </div>
          )}

          {/* Email Field */}
          <div className="form-group">
            <label className="form-label">
              Email Address
            </label>
            <div className="input-wrapper">
              <Mail className="input-icon" size={16} />
              <input
                type="email"
                placeholder="you@example.com"
                className="form-input has-icon"
                {...register('email', { 
                  required: 'Email address is required',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Invalid email address format'
                  }
                })}
              />
            </div>
            {errors.email && (
              <span className="text-[11px] text-red-400 font-medium block">
                {errors.email.message}
              </span>
            )}
          </div>

          {/* Password Field */}
          <div className="form-group">
            <label className="form-label">
              Password
            </label>
            <div className="input-wrapper">
              <Lock className="input-icon" size={16} />
              <input
                type="password"
                placeholder="••••••••"
                className="form-input has-icon"
                {...register('password', { 
                  required: 'Password is required',
                  minLength: {
                    value: 6,
                    message: 'Password must be at least 6 characters long'
                  }
                })}
              />
            </div>
            {errors.password && (
              <span className="text-[11px] text-red-400 font-medium block">
                {errors.password.message}
              </span>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="btn-primary mt-2"
          >
            {loading ? (
              <Loader2 className="animate-spin text-white" size={18} />
            ) : (
              <>
                <span>{isLogin ? 'Sign In' : 'Register Account'}</span>
                <ChevronRight size={16} />
              </>
            )}
          </button>
        </form>

        {/* Toggle Mode footer */}
        <div className="mt-8 text-sm text-slate-400">
          <span>{isLogin ? "Don't have an account? " : 'Already registered? '}</span>
          <button
            onClick={toggleMode}
            className="text-cyan-400 hover:text-cyan-300 font-semibold cursor-pointer underline transition-colors"
          >
            {isLogin ? 'Create one now' : 'Sign in here'}
          </button>
        </div>
      </div>
    </div>
  );
}
