// src/components/Layout.jsx
import React from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Boxes, 
  Settings as SettingsIcon, 
  LogOut, 
  User,
  Building2
} from 'lucide-react';
import { toast } from 'react-toastify';

export default function Layout({ children, user, onLogout }) {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Products', path: '/products', icon: Boxes },
    { name: 'Settings', path: '/settings', icon: SettingsIcon },
  ];

  const handleLogoutClick = () => {
    onLogout();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  const getPageTitle = () => {
    switch (location.pathname) {
      case '/dashboard':
        return 'Dashboard Overview';
      case '/products':
        return 'Inventory Items';
      case '/settings':
        return 'Organization Settings';
      default:
        return 'StockFlow MVP';
    }
  };

  return (
    <div className="app-container">
      {/* Sidebar */}
      <aside className="sidebar glass">
        <div className="logo-container">
          <div className="logo-icon">
            <Boxes size={20} color="#fff" />
          </div>
          <span className="logo-text">StockFlow</span>
        </div>

        <nav className="flex-grow">
          <ul className="nav-menu">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <li key={item.name} className="nav-item">
                  <Link 
                    to={item.path} 
                    className={`nav-link-btn ${isActive ? 'active' : ''}`}
                  >
                    <Icon size={18} />
                    <span>{item.name}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* User profile footer */}
        <div className="user-footer">
          <div className="user-info">
            <div className="user-avatar">
              <User size={16} />
            </div>
            <div className="user-details">
              <p className="user-email" title={user?.email}>{user?.email}</p>
              <div className="flex items-center gap-1 mt-0.5 text-slate-400">
                <Building2 size={10} className="inline text-cyan-400" />
                <span className="text-[10px] font-semibold text-ellipsis overflow-hidden whitespace-nowrap max-w-[150px] inline-block align-middle">
                  {user?.organizationName}
                </span>
              </div>
            </div>
          </div>
          <button 
            onClick={handleLogoutClick} 
            className="logout-btn"
            title="Log out from session"
          >
            <LogOut size={14} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Workspace Area */}
      <main className="workspace">
        <header className="workspace-header glass">
          <h1 className="header-title">{getPageTitle()}</h1>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900/60 border border-slate-800 text-xs">
              <div className="sync-indicator-dot active"></div>
              <span className="text-slate-300 font-medium select-none">Live Connection</span>
            </div>
          </div>
        </header>

        {/* Dynamic page content */}
        <div className="flex-grow overflow-hidden relative">
          {children}
        </div>
      </main>
    </div>
  );
}
