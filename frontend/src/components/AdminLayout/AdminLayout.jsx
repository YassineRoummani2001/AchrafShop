import React, { useState, useEffect } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../../store/slices/authSlice';
import {
  FiGrid, FiPackage, FiShoppingBag, FiUsers, FiTag,
  FiLogOut, FiMenu, FiChevronRight, FiExternalLink, FiSun, FiMoon, FiImage, FiLayout
} from 'react-icons/fi';
import './AdminLayout.css';

const NAV = [
  { to: '/admin',          label: 'Dashboard',  icon: FiGrid,        end: true },
  { to: '/admin/products', label: 'Products',   icon: FiPackage },
  { to: '/admin/orders',   label: 'Orders',     icon: FiShoppingBag },
  { to: '/admin/users',    label: 'Users',      icon: FiUsers },
  { to: '/admin/brands',   label: 'Brands',     icon: FiTag },
  { to: '/admin/hero',     label: 'Hero Slides', icon: FiImage },
  { to: '/admin/themes',   label: 'Themes',     icon: FiLayout },
];

export default function AdminLayout() {
  const dispatch     = useDispatch();
  const navigate     = useNavigate();
  const { userInfo } = useSelector((s) => s.auth);
  const [collapsed,   setCollapsed]   = useState(false);
  const [mobileOpen,  setMobileOpen]  = useState(false);

  // ── Theme ──────────────────────────────────────────────────────────
  const [theme, setTheme] = useState(() => localStorage.getItem('adminTheme') || 'dark');

  useEffect(() => {
    localStorage.setItem('adminTheme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme((t) => (t === 'dark' ? 'light' : 'dark'));

  // ── Logout ─────────────────────────────────────────────────────────
  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  return (
    <div
      className={`admin-shell ${collapsed ? 'sidebar-collapsed' : ''}`}
      data-admin-theme={theme}
    >
      {/* Mobile overlay */}
      {mobileOpen && <div className="admin-overlay" onClick={() => setMobileOpen(false)} />}

      {/* ── Sidebar ─────────────────────────────────────────────── */}
      <aside className={`admin-sidebar ${mobileOpen ? 'mobile-open' : ''}`}>
        <div className="admin-sidebar-header">
          {!collapsed && (
            <div className="admin-brand">
              <span className="brand-a">ACHRAF</span>
              <span className="brand-shop">SHOP</span>
              <span className="brand-badge">Admin</span>
            </div>
          )}
          <button className="sidebar-toggle" onClick={() => setCollapsed(!collapsed)} title="Collapse sidebar">
            <FiChevronRight className={collapsed ? '' : 'rotated'} />
          </button>
        </div>

        <nav className="admin-nav">
          {NAV.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to} to={to} end={end}
              className={({ isActive }) => `admin-nav-link ${isActive ? 'active' : ''}`}
              onClick={() => setMobileOpen(false)}
              title={collapsed ? label : undefined}
            >
              <Icon size={18} className="nav-icon" />
              {!collapsed && <span>{label}</span>}
            </NavLink>
          ))}
        </nav>

        <div className="admin-sidebar-footer">
          <a href="/" target="_blank" rel="noreferrer" className="admin-nav-link" title="View Store">
            <FiExternalLink size={18} className="nav-icon" />
            {!collapsed && <span>View Store</span>}
          </a>
          <button className="admin-nav-link logout-btn" onClick={handleLogout} title="Logout">
            <FiLogOut size={18} className="nav-icon" />
            {!collapsed && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* ── Main ────────────────────────────────────────────────── */}
      <div className="admin-main">
        {/* Top bar */}
        <header className="admin-topbar">
          <button className="mobile-menu-btn" onClick={() => setMobileOpen(true)} title="Open menu">
            <FiMenu size={22} />
          </button>

          <div className="topbar-title" />

          <div className="topbar-right">
            {/* Theme toggle */}
            <button
              className="theme-toggle"
              onClick={toggleTheme}
              title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {theme === 'dark' ? <FiSun size={17} /> : <FiMoon size={17} />}
            </button>

            {/* User info */}
            <div className="topbar-user">
              <div className="topbar-avatar">{userInfo?.name?.charAt(0).toUpperCase()}</div>
              <div className="topbar-user-info">
                <span className="topbar-name">{userInfo?.name}</span>
                <span className="topbar-role">Administrator</span>
              </div>
            </div>
          </div>
        </header>

        {/* Page */}
        <div className="admin-content">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
