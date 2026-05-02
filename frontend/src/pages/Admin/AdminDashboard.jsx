import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { fetchStats } from '../../store/slices/adminSlice';
import { FiUsers, FiPackage, FiShoppingBag, FiDollarSign, FiClock, FiArrowRight, FiDownload } from 'react-icons/fi';
import { generateOrderPDF } from '../../utils/pdfExport';
import '../../components/AdminLayout/AdminLayout.css';

const STATUS_COLOR = {
  pending: 'status-pending', processing: 'status-processing',
  shipped: 'status-shipped', delivered: 'status-delivered', cancelled: 'status-cancelled',
};

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

export default function AdminDashboard() {
  const dispatch = useDispatch();
  const { stats, loading } = useSelector((s) => s.admin);

  useEffect(() => { dispatch(fetchStats()); }, [dispatch]);

  if (loading && !stats) return <div className="admin-loading"><div className="admin-spinner" /></div>;

  const statCards = [
    { label: 'Total Users',    value: stats?.totalUsers    ?? '—', icon: FiUsers,       bg: 'rgba(96,165,250,0.12)',  color: '#60a5fa' },
    { label: 'Total Products', value: stats?.totalProducts ?? '—', icon: FiPackage,     bg: 'rgba(167,139,250,0.12)', color: '#a78bfa' },
    { label: 'Total Orders',   value: stats?.totalOrders   ?? '—', icon: FiShoppingBag, bg: 'rgba(251,191,36,0.12)',  color: '#fbbf24' },
    { label: 'Total Revenue',  value: stats ? `$${Number(stats.totalRevenue).toFixed(2)}` : '—', icon: FiDollarSign, bg: 'rgba(34,197,94,0.12)', color: '#22c55e' },
  ];

  const maxRev = Math.max(...(stats?.monthlyRevenue?.map(m => m.revenue) || [1]));

  return (
    <div>
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Dashboard</h1>
          <p className="admin-page-subtitle">Welcome back — here's what's happening today.</p>
        </div>
      </div>

      {/* Stat cards */}
      <div className="admin-stat-grid">
        {statCards.map(({ label, value, icon: Icon, bg, color }) => (
          <div key={label} className="admin-stat-card">
            <div className="stat-icon-wrap" style={{ background: bg }}>
              <Icon size={22} color={color} />
            </div>
            <div>
              <p className="stat-label">{label}</p>
              <p className="stat-value">{value}</p>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1.25rem' }}>
        {/* Revenue chart */}
        <div className="admin-card">
          <h3 style={{ fontSize:'1rem', fontWeight:700, marginBottom:'1.25rem', color:'#e2e8f0' }}>
            Revenue (Last 6 Months)
          </h3>
          {stats?.monthlyRevenue?.length > 0 ? (
            <div style={{ display:'flex', alignItems:'flex-end', gap:'0.5rem', height:120 }}>
              {stats.monthlyRevenue.map((m, i) => (
                <div key={i} style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', gap:'0.4rem' }}>
                  <span style={{ fontSize:'0.7rem', color:'#64748b' }}>${Math.round(m.revenue)}</span>
                  <div style={{
                    width:'100%',
                    height: `${Math.max(8, (m.revenue / maxRev) * 90)}px`,
                    background: 'linear-gradient(to top, #c9a96e, #e8c97a)',
                    borderRadius:'4px 4px 0 0',
                    transition: 'height 0.4s ease',
                  }} />
                  <span style={{ fontSize:'0.7rem', color:'#64748b' }}>{MONTHS[m._id.month - 1]}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="admin-empty"><p>No revenue data yet.</p></div>
          )}
        </div>

        {/* Orders by status */}
        <div className="admin-card">
          <h3 style={{ fontSize:'1rem', fontWeight:700, marginBottom:'1.25rem', color:'#e2e8f0' }}>
            Orders by Status
          </h3>
          <div style={{ display:'flex', flexDirection:'column', gap:'0.65rem' }}>
            {stats?.ordersByStatus?.length > 0 ? stats.ordersByStatus.map((s) => {
              const pct = stats.totalOrders ? Math.round((s.count / stats.totalOrders) * 100) : 0;
              return (
                <div key={s._id}>
                  <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'0.3rem' }}>
                    <span className={`status-badge ${STATUS_COLOR[s._id] || ''}`}>{s._id}</span>
                    <span style={{ fontSize:'0.8rem', color:'#94a3b8' }}>{s.count} ({pct}%)</span>
                  </div>
                  <div style={{ height:6, background:'rgba(255,255,255,0.07)', borderRadius:3 }}>
                    <div style={{ height:'100%', width:`${pct}%`, background:'#c9a96e', borderRadius:3 }} />
                  </div>
                </div>
              );
            }) : <div className="admin-empty"><p>No orders yet.</p></div>}
          </div>
        </div>
      </div>

      {/* Recent orders */}
      <div className="admin-card" style={{ marginTop:'1.25rem' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1rem' }}>
          <h3 style={{ fontSize:'1rem', fontWeight:700, color:'#e2e8f0', display:'flex', alignItems:'center', gap:'0.5rem' }}>
            <FiClock size={16} color="#c9a96e" /> Recent Orders
          </h3>
          <Link to="/admin/orders" style={{ fontSize:'0.8rem', color:'#c9a96e', display:'flex', alignItems:'center', gap:'0.3rem', textDecoration:'none' }}>
            View all <FiArrowRight size={13} />
          </Link>
        </div>
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Order ID</th><th>Customer</th><th>Total</th><th>Status</th><th>Date</th><th style={{textAlign:'center'}}>Action</th>
              </tr>
            </thead>
            <tbody>
              {stats?.recentOrders?.length > 0 ? stats.recentOrders.map((o) => (
                <tr key={o._id}>
                  <td style={{ fontFamily:'monospace', fontSize:'0.75rem' }}>#{o._id.slice(-8).toUpperCase()}</td>
                  <td>
                    <div style={{ fontWeight:600 }}>{o.user?.name || 'Guest'}</div>
                    <div style={{ fontSize:'0.75rem', color:'#64748b' }}>{o.user?.email}</div>
                  </td>
                  <td style={{ fontWeight:700 }}>${o.totalPrice?.toFixed(2)}</td>
                  <td><span className={`status-badge ${STATUS_COLOR[o.orderStatus] || ''}`}>{o.orderStatus}</span></td>
                  <td style={{ color:'#64748b', fontSize:'0.8rem' }}>{new Date(o.createdAt).toLocaleDateString()}</td>
                  <td style={{ textAlign:'center' }}>
                    <button 
                      onClick={() => generateOrderPDF(o)} 
                      style={{ background:'none', border:'none', color:'#c9a96e', cursor:'pointer' }}
                      title="Export PDF"
                    >
                      <FiDownload size={16} />
                    </button>
                  </td>
                </tr>
              )) : (
                <tr><td colSpan={6} className="admin-empty">No recent orders.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
