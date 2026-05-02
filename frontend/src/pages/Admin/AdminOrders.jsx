import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAdminOrders, updateAdminOrderStatus } from '../../store/slices/adminSlice';
import { FiShoppingBag, FiSearch, FiRefreshCw, FiClock, FiTruck, FiCheckCircle, FiXCircle, FiLoader, FiDownload } from 'react-icons/fi';
import { toast } from 'react-toastify';
import { generateOrderPDF } from '../../utils/pdfExport';
import '../../components/AdminLayout/AdminLayout.css';

/* ── Constants ───────────────────────────────────────────────────── */
const STATUS_META = {
  pending:    { label: 'Pending',    cls: 'status-pending',    icon: FiClock,       color: '#fbbf24', bg: 'rgba(251,191,36,0.12)'  },
  processing: { label: 'Processing', cls: 'status-processing', icon: FiLoader,      color: '#60a5fa', bg: 'rgba(96,165,250,0.12)'  },
  shipped:    { label: 'Shipped',    cls: 'status-shipped',    icon: FiTruck,       color: '#a78bfa', bg: 'rgba(167,139,250,0.12)' },
  delivered:  { label: 'Delivered',  cls: 'status-delivered',  icon: FiCheckCircle, color: '#22c55e', bg: 'rgba(34,197,94,0.12)'   },
  cancelled:  { label: 'Cancelled',  cls: 'status-cancelled',  icon: FiXCircle,     color: '#f87171', bg: 'rgba(248,113,113,0.12)' },
};

const STATUS_FLOW   = ['pending', 'processing', 'shipped', 'delivered'];
const STEPPER_STEPS = ['pending', 'processing', 'shipped', 'delivered'];

/* ── Mini stepper ────────────────────────────────────────────────── */
function MiniStepper({ status }) {
  if (status === 'cancelled') {
    return (
      <div style={{ display:'flex', alignItems:'center', gap:'0.4rem', fontSize:'0.75rem', color:'#f87171', fontWeight:600, padding:'0.5rem 0' }}>
        <FiXCircle size={13} /> Cancelled
      </div>
    );
  }
  const cur = STEPPER_STEPS.indexOf(status);
  return (
    <div style={{ display:'flex', alignItems:'center', gap:'4px', padding:'0.5rem 0' }}>
      {STEPPER_STEPS.map((s, idx) => {
        const done    = idx < cur;
        const current = idx === cur;
        const m = STATUS_META[s];
        return (
          <React.Fragment key={s}>
            <div title={m.label} style={{
              width: 22, height: 22, borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '0.6rem', fontWeight: 700, flexShrink: 0,
              background: done ? m.color : current ? 'transparent' : 'var(--ab-tag-bg)',
              border: `2px solid ${done || current ? m.color : 'var(--ab-border-input)'}`,
              color: done ? '#fff' : current ? m.color : 'var(--ab-text-faint)',
              boxShadow: current ? `0 0 0 3px ${m.bg}` : 'none',
              transition: 'all 0.2s',
            }}>
              {done ? '✓' : <m.icon size={10} />}
            </div>
            {idx < STEPPER_STEPS.length - 1 && (
              <div style={{
                flex: 1, height: 2, minWidth: 10,
                background: done ? m.color : 'var(--ab-border)',
                borderRadius: 1, transition: 'background 0.3s',
              }} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════
   Main Page
   ════════════════════════════════════════════════════════════════════ */
export default function AdminOrders() {
  const dispatch = useDispatch();
  const { orders, loading, actionLoading } = useSelector((s) => s.admin);
  const [search,       setSearch]       = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [updating,     setUpdating]     = useState(null);

  useEffect(() => { dispatch(fetchAdminOrders()); }, [dispatch]);

  /* ── Status counts ──────────────────────────────────────────────── */
  const counts = Object.keys(STATUS_META).reduce((acc, k) => {
    acc[k] = orders.filter(o => o.orderStatus === k).length;
    return acc;
  }, {});

  /* ── Status update ──────────────────────────────────────────────── */
  const handleStatusChange = async (id, status) => {
    setUpdating(id);
    const res = await dispatch(updateAdminOrderStatus({ id, status }));
    setUpdating(null);
    if (res.meta.requestStatus === 'fulfilled') toast.success(`Status updated → ${status}`);
    else toast.error('Failed to update status');
  };

  /* ── Quick status buttons (click to advance) ────────────────────── */
  const handleAdvance = async (order) => {
    const cur = STATUS_FLOW.indexOf(order.orderStatus);
    if (cur === -1 || cur >= STATUS_FLOW.length - 1) return;
    await handleStatusChange(order._id, STATUS_FLOW[cur + 1]);
  };

  /* ── Filter ─────────────────────────────────────────────────────── */
  const filtered = orders.filter((o) => {
    const matchSearch = !search ||
      o._id.toLowerCase().includes(search.toLowerCase()) ||
      o.shippingInfo?.fullName?.toLowerCase().includes(search.toLowerCase()) ||
      o.shippingInfo?.email?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = !statusFilter || o.orderStatus === statusFilter;
    return matchSearch && matchStatus;
  });

  /* ── Pagination ─────────────────────────────────────────────── */
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
  useEffect(() => { setCurrentPage(1); }, [search, statusFilter]);
  
  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const paginatedData = filtered.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  /* ════════════════════════════════════════════════════════════════ */
  return (
    <div>
      {/* ── Header ────────────────────────────────────────────────── */}
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Orders Management</h1>
          <p className="admin-page-subtitle">{orders.length} total orders</p>
        </div>
        <button className="btn-admin-ghost" onClick={() => dispatch(fetchAdminOrders())}>
          <FiRefreshCw size={14} /> Refresh
        </button>
      </div>

      {/* ── Status stat cards ─────────────────────────────────────── */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(140px, 1fr))', gap:'0.75rem', marginBottom:'1.5rem' }}>
        {Object.entries(STATUS_META).map(([key, meta]) => {
          const Icon = meta.icon;
          const active = statusFilter === key;
          return (
            <button
              key={key}
              onClick={() => setStatusFilter(active ? '' : key)}
              style={{
                background: active ? meta.bg : 'var(--ab-card)',
                border: `1.5px solid ${active ? meta.color : 'var(--ab-border)'}`,
                borderRadius: 10, padding: '0.875rem 1rem',
                cursor: 'pointer', text: 'left', transition: 'all 0.18s',
                display: 'flex', flexDirection: 'column', gap: '0.35rem',
              }}
            >
              <div style={{ display:'flex', alignItems:'center', gap:'0.5rem' }}>
                <div style={{ width:28, height:28, borderRadius:7, background:meta.bg, display:'flex', alignItems:'center', justifyContent:'center' }}>
                  <Icon size={14} color={meta.color} />
                </div>
                <span style={{ fontSize:'0.72rem', fontWeight:700, color:'var(--ab-text-faint)', textTransform:'uppercase', letterSpacing:'0.05em' }}>
                  {meta.label}
                </span>
              </div>
              <span style={{ fontSize:'1.6rem', fontWeight:800, color: active ? meta.color : 'var(--ab-text)', lineHeight:1 }}>
                {counts[key] || 0}
              </span>
            </button>
          );
        })}
      </div>

      {/* ── Table card ────────────────────────────────────────────── */}
      <div className="admin-card" style={{ paddingBottom: 0 }}>
        {/* Filters */}
        <div style={{ display:'flex', gap:'0.75rem', marginBottom:'1.25rem', flexWrap:'wrap', alignItems:'center' }}>
          <div style={{ position:'relative', flex:1, minWidth:200 }}>
            <FiSearch size={14} style={{ position:'absolute', left:'0.75rem', top:'50%', transform:'translateY(-50%)', color:'var(--ab-text-faint)' }} />
            <input
              className="admin-search"
              style={{ paddingLeft:'2rem', width:'100%', boxSizing:'border-box' }}
              placeholder="Search by ID, name, email…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <select className="admin-select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="">All Statuses</option>
            {Object.entries(STATUS_META).map(([k, m]) => (
              <option key={k} value={k}>{m.label}</option>
            ))}
          </select>
          {(search || statusFilter) && (
            <button className="btn-admin-ghost" onClick={() => { setSearch(''); setStatusFilter(''); }}>
              Clear
            </button>
          )}
          <span style={{ fontSize:'0.8rem', color:'var(--ab-text-faint)', marginLeft:'auto' }}>
            {filtered.length} result{filtered.length !== 1 ? 's' : ''}
          </span>
        </div>

        {loading ? (
          <div className="admin-loading"><div className="admin-spinner" /></div>
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Order</th>
                  <th>Customer</th>
                  <th>Items</th>
                  <th>Total</th>
                  <th>Payment</th>
                  <th>Progress</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th>Update Status</th>
                </tr>
              </thead>
              <tbody>
                {paginatedData.length === 0 ? (
                  <tr><td colSpan={9}>
                    <div className="admin-empty">
                      <div className="admin-empty-icon"><FiShoppingBag /></div>
                      <p>No orders found</p>
                    </div>
                  </td></tr>
                ) : paginatedData.map((o) => {
                  const isUpdating   = updating === o._id;
                  const curFlowIdx   = STATUS_FLOW.indexOf(o.orderStatus);
                  const canAdvance   = curFlowIdx >= 0 && curFlowIdx < STATUS_FLOW.length - 1;
                  const nextStatus   = canAdvance ? STATUS_FLOW[curFlowIdx + 1] : null;
                  const nextMeta     = nextStatus ? STATUS_META[nextStatus] : null;

                  return (
                    <tr key={o._id}>
                      {/* Order ID */}
                      <td>
                        <div style={{ display:'flex', alignItems:'center', gap:'0.5rem' }}>
                          <span style={{ fontFamily:'monospace', fontSize:'0.75rem', color:'var(--ab-gold)', fontWeight:700 }}>
                            #{o._id.slice(-8).toUpperCase()}
                          </span>
                          <button 
                            onClick={() => generateOrderPDF(o)} 
                            style={{ background:'none', border:'none', color:'var(--ab-text-faint)', cursor:'pointer' }}
                            title="Export PDF"
                          >
                            <FiDownload size={14} />
                          </button>
                        </div>
                      </td>

                      {/* Customer */}
                      <td>
                        <div style={{ fontWeight:600, color:'var(--ab-text)', maxWidth:160 }}>
                          {o.shippingInfo?.fullName || o.user?.name || '—'}
                        </div>
                        <div style={{ fontSize:'0.73rem', color:'var(--ab-text-faint)' }}>
                          {o.shippingInfo?.phone || o.shippingInfo?.email || o.user?.email}
                        </div>
                      </td>

                      {/* Items */}
                      <td>
                        <div style={{ display:'flex', flexDirection:'column', gap:'0.2rem' }}>
                          {o.orderItems?.slice(0, 2).map((item, i) => (
                            <div key={i} style={{ fontSize:'0.75rem', color:'var(--ab-text-muted)', whiteSpace:'nowrap', maxWidth:140, overflow:'hidden', textOverflow:'ellipsis' }}>
                              {item.name}
                            </div>
                          ))}
                          {o.orderItems?.length > 2 && (
                            <span style={{ fontSize:'0.7rem', color:'var(--ab-text-faint)' }}>
                              +{o.orderItems.length - 2} more
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Total */}
                      <td>
                        <span style={{ fontWeight:700, color:'var(--ab-text)', fontSize:'0.9rem' }}>
                          ${o.totalPrice?.toFixed(2)}
                        </span>
                      </td>

                      {/* Payment */}
                      <td>
                        <div style={{ display:'flex', flexDirection:'column', gap:'0.2rem' }}>
                          <span style={{ fontSize:'0.75rem', color: o.isPaid ? '#22c55e' : '#f87171', fontWeight:700 }}>
                            {o.isPaid ? '✓ Paid' : '✗ Unpaid'}
                          </span>
                          <span style={{ fontSize:'0.7rem', color:'var(--ab-text-faint)', textTransform:'capitalize' }}>
                            {o.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Card'}
                          </span>
                        </div>
                      </td>

                      {/* Progress stepper */}
                      <td style={{ minWidth:160 }}>
                        <MiniStepper status={o.orderStatus} />
                      </td>

                      {/* Status badge */}
                      <td>
                        <span className={`status-badge ${STATUS_META[o.orderStatus]?.cls || ''}`}>
                          {STATUS_META[o.orderStatus]?.label || o.orderStatus}
                        </span>
                      </td>

                      {/* Date */}
                      <td style={{ color:'var(--ab-text-faint)', fontSize:'0.78rem', whiteSpace:'nowrap' }}>
                        {new Date(o.createdAt).toLocaleDateString('en-GB', { day:'2-digit', month:'short', year:'numeric' })}
                      </td>

                      {/* Status control */}
                      <td>
                        {o.orderStatus === 'delivered' ? (
                          /* Delivered — truly final */
                          <span style={{ fontSize:'0.75rem', color:'#22c55e', fontWeight:700, display:'flex', alignItems:'center', gap:'0.35rem' }}>
                            <FiCheckCircle size={13} /> Completed
                          </span>
                        ) : o.orderStatus === 'cancelled' ? (
                          /* Cancelled — allow restore */
                          <div style={{ display:'flex', flexDirection:'column', gap:'0.4rem' }}>
                            <button
                              style={{
                                background: 'rgba(251,191,36,0.15)',
                                border: '1.5px solid rgba(251,191,36,0.4)',
                                color: '#fbbf24',
                                borderRadius: 7,
                                padding: '0.35rem 0.65rem',
                                fontSize: '0.75rem',
                                fontWeight: 700,
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.3rem',
                                transition: 'all 0.2s',
                                whiteSpace: 'nowrap',
                              }}
                              disabled={isUpdating}
                              onClick={() => handleStatusChange(o._id, 'pending')}
                              onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(251,191,36,0.28)'; }}
                              onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(251,191,36,0.15)'; }}
                            >
                              {isUpdating ? '…' : '↩ Restore to Pending'}
                            </button>
                          </div>
                        ) : (
                          <div style={{ display:'flex', flexDirection:'column', gap:'0.4rem' }}>
                            {/* Quick advance button */}
                            {nextMeta && (
                              <button
                                className="btn-admin-primary"
                                style={{ padding:'0.35rem 0.65rem', fontSize:'0.75rem', gap:'0.3rem', background:`linear-gradient(135deg, ${nextMeta.color}, ${nextMeta.color}cc)` }}
                                disabled={isUpdating}
                                onClick={() => handleAdvance(o)}
                              >
                                {isUpdating ? '…' : `→ ${nextMeta.label}`}
                              </button>
                            )}
                            {/* Cancel button */}
                            {o.orderStatus !== 'cancelled' && (
                              <button
                                className="btn-admin-danger"
                                style={{ padding:'0.3rem 0.65rem', fontSize:'0.73rem' }}
                                disabled={isUpdating}
                                onClick={() => handleStatusChange(o._id, 'cancelled')}
                              >
                                {isUpdating ? '…' : 'Cancel'}
                              </button>
                            )}
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            
            {/* ── Pagination Controls ── */}
            {totalPages > 1 && (
              <div className="admin-pagination">
                <div className="admin-pagination-info">
                  Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filtered.length)} of {filtered.length} entries
                </div>
                <div className="admin-pagination-controls">
                  <button 
                    disabled={currentPage === 1} 
                    onClick={() => setCurrentPage(p => p - 1)}
                  >
                    Previous
                  </button>
                  <button 
                    disabled={currentPage === totalPages} 
                    onClick={() => setCurrentPage(p => p + 1)}
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
