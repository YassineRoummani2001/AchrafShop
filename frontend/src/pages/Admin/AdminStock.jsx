import React, { useEffect, useState, useCallback } from 'react';
import { FiPackage, FiSearch, FiAlertTriangle, FiRefreshCw, FiPlus, FiMinus, FiEdit3, FiCheck, FiX } from 'react-icons/fi';
import api from '../../utils/api';
import { toast } from 'react-toastify';
import '../../components/AdminLayout/AdminLayout.css';

const LOW_STOCK = 5;
const OUT_STOCK  = 0;

function StockBadge({ stock }) {
  if (stock === 0)   return <span className="status-badge badge-cancelled">Out of Stock</span>;
  if (stock <= LOW_STOCK) return <span className="status-badge badge-processing">Low Stock</span>;
  return <span className="status-badge badge-delivered">In Stock</span>;
}

export default function AdminStock() {
  const [products, setProducts]   = useState([]);
  const [loading, setLoading]     = useState(true);
  const [search, setSearch]       = useState('');
  const [filter, setFilter]       = useState('all'); // all | low | out
  const [editId, setEditId]       = useState(null);  // which row is being edited
  const [editVal, setEditVal]     = useState('');
  const [saving, setSaving]       = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/products/admin/all');
      setProducts(data.data);
    } catch { toast.error('Failed to load products'); }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { setCurrentPage(1); }, [search, filter]);

  /* ── Filtering ── */
  const filtered = products.filter(p => {
    const matchSearch = !search || p.name.toLowerCase().includes(search.toLowerCase()) || p.brand?.toLowerCase().includes(search.toLowerCase());
    const matchFilter =
      filter === 'all' ? true :
      filter === 'out' ? p.stock === OUT_STOCK :
      filter === 'low' ? p.stock > OUT_STOCK && p.stock <= LOW_STOCK : true;
    return matchSearch && matchFilter;
  });

  const totalPages   = Math.ceil(filtered.length / itemsPerPage);
  const paginated    = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  /* ── Stats ── */
  const outCount = products.filter(p => p.stock === 0).length;
  const lowCount = products.filter(p => p.stock > 0 && p.stock <= LOW_STOCK).length;
  const okCount  = products.filter(p => p.stock > LOW_STOCK).length;

  /* ── Quick adjust ── */
  const quickAdjust = async (id, operation, amount = 1) => {
    setSaving(id);
    try {
      const { data } = await api.patch(`/products/${id}/stock`, { stock: amount, operation });
      setProducts(prev => prev.map(p => p._id === id ? { ...p, stock: data.data.stock } : p));
    } catch { toast.error('Failed to update stock'); }
    setSaving(null);
  };

  /* ── Inline set ── */
  const startEdit = (p) => { setEditId(p._id); setEditVal(String(p.stock)); };
  const cancelEdit = () => { setEditId(null); setEditVal(''); };
  const confirmEdit = async (id) => {
    const val = parseInt(editVal, 10);
    if (isNaN(val) || val < 0) { toast.error('Invalid stock value'); return; }
    setSaving(id);
    try {
      const { data } = await api.patch(`/products/${id}/stock`, { stock: val, operation: 'set' });
      setProducts(prev => prev.map(p => p._id === id ? { ...p, stock: data.data.stock } : p));
      toast.success('Stock updated');
      setEditId(null);
    } catch { toast.error('Failed to update stock'); }
    setSaving(null);
  };

  return (
    <div>
      {/* ── Header ── */}
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Stock Management</h1>
          <p className="admin-page-subtitle">{products.length} products · {outCount} out of stock · {lowCount} low stock</p>
        </div>
        <button className="btn-admin-ghost" onClick={load}>
          <FiRefreshCw size={14} /> Refresh
        </button>
      </div>

      {/* ── Stat Cards ── */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(140px,1fr))', gap:'0.75rem', marginBottom:'1.5rem' }}>
        {[
          { label:'In Stock',    count: okCount,  color:'#22c55e', bg:'rgba(34,197,94,0.1)',   emoji:'✅', key:'all' },
          { label:'Low Stock',   count: lowCount, color:'#f59e0b', bg:'rgba(245,158,11,0.1)',  emoji:'⚠️', key:'low' },
          { label:'Out of Stock',count: outCount, color:'#f87171', bg:'rgba(248,113,113,0.1)', emoji:'❌', key:'out' },
        ].map(card => (
          <button key={card.key}
            onClick={() => setFilter(filter === card.key ? 'all' : card.key)}
            style={{
              background: filter === card.key ? card.bg : 'var(--ab-card)',
              border: `1.5px solid ${filter === card.key ? card.color : 'var(--ab-border)'}`,
              borderRadius:10, padding:'0.875rem 1rem', cursor:'pointer',
              display:'flex', flexDirection:'column', gap:'0.35rem', textAlign:'left',
              transition:'all 0.18s',
            }}
          >
            <span style={{ fontSize:'0.72rem', fontWeight:700, color:'var(--ab-text-faint)', textTransform:'uppercase', letterSpacing:'0.05em' }}>
              {card.emoji} {card.label}
            </span>
            <span style={{ fontSize:'1.8rem', fontWeight:800, color: filter === card.key ? card.color : 'var(--ab-text)', lineHeight:1 }}>
              {card.count}
            </span>
          </button>
        ))}
      </div>

      {/* ── Table ── */}
      <div className="admin-card" style={{ paddingBottom:0 }}>
        {/* Search & filter row */}
        <div style={{ display:'flex', gap:'0.75rem', marginBottom:'1.25rem', flexWrap:'wrap', alignItems:'center' }}>
          <div style={{ position:'relative', flex:1, minWidth:200 }}>
            <FiSearch size={14} style={{ position:'absolute', left:'0.75rem', top:'50%', transform:'translateY(-50%)', color:'var(--ab-text-faint)' }} />
            <input className="admin-search" style={{ paddingLeft:'2rem', width:'100%', boxSizing:'border-box' }}
              placeholder="Search product or brand…" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          {filter !== 'all' && (
            <button className="btn-admin-ghost" onClick={() => setFilter('all')}>Clear filter</button>
          )}
          {outCount > 0 && (
            <span style={{ display:'flex', alignItems:'center', gap:'0.35rem', fontSize:'0.8rem', color:'#f87171', fontWeight:600 }}>
              <FiAlertTriangle size={13} /> {outCount} product{outCount !== 1 ? 's' : ''} out of stock
            </span>
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
                  <th>Product</th>
                  <th>Brand</th>
                  <th>Price</th>
                  <th>Status</th>
                  <th style={{ textAlign:'center' }}>Stock</th>
                  <th style={{ textAlign:'center' }}>Adjust</th>
                </tr>
              </thead>
              <tbody>
                {paginated.length === 0 ? (
                  <tr><td colSpan={6}>
                    <div className="admin-empty">
                      <div className="admin-empty-icon"><FiPackage /></div>
                      <p>No products found</p>
                    </div>
                  </td></tr>
                ) : paginated.map(p => {
                  const isEditing = editId === p._id;
                  const isSaving  = saving === p._id;
                  return (
                    <tr key={p._id} style={{ background: p.stock === 0 ? 'rgba(248,113,113,0.04)' : p.stock <= LOW_STOCK ? 'rgba(245,158,11,0.04)' : '' }}>
                      {/* Product */}
                      <td>
                        <div style={{ display:'flex', alignItems:'center', gap:'0.65rem' }}>
                          {p.images?.[0]?.url ? (
                            <img src={p.images[0].url} alt={p.name}
                              style={{ width:40, height:40, objectFit:'cover', borderRadius:8, border:'1px solid var(--ab-border)', flexShrink:0 }}
                              onError={e => e.target.style.display='none'}
                            />
                          ) : (
                            <div style={{ width:40, height:40, borderRadius:8, background:'var(--ab-tag-bg)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                              📦
                            </div>
                          )}
                          <div>
                            <div style={{ fontWeight:600, color:'var(--ab-text)', maxWidth:200, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{p.name}</div>
                            <div style={{ fontSize:'0.72rem', color:'var(--ab-text-faint)', textTransform:'capitalize' }}>{p.gender} · {p.category?.name || '—'}</div>
                          </div>
                        </div>
                      </td>

                      {/* Brand */}
                      <td style={{ color:'var(--ab-text-muted)', fontSize:'0.82rem' }}>{p.brand || '—'}</td>

                      {/* Price */}
                      <td style={{ fontWeight:700, color:'var(--ab-gold)' }}>${p.price?.toFixed(2)}</td>

                      {/* Status badge */}
                      <td><StockBadge stock={p.stock} /></td>

                      {/* Stock qty — inline edit */}
                      <td style={{ textAlign:'center' }}>
                        {isEditing ? (
                          <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:'0.3rem' }}>
                            <input
                              type="number" min="0"
                              value={editVal}
                              onChange={e => setEditVal(e.target.value)}
                              onKeyDown={e => { if (e.key === 'Enter') confirmEdit(p._id); if (e.key === 'Escape') cancelEdit(); }}
                              style={{ width:60, padding:'0.3rem 0.5rem', borderRadius:8, border:'1.5px solid var(--ab-gold)', background:'var(--ab-card)', color:'var(--ab-text)', fontSize:'0.9rem', textAlign:'center' }}
                              autoFocus
                            />
                            <button className="btn-admin-primary" style={{ padding:'0.3rem 0.5rem', minWidth:'unset' }} disabled={isSaving} onClick={() => confirmEdit(p._id)}>
                              {isSaving ? '…' : <FiCheck size={13} />}
                            </button>
                            <button className="btn-admin-ghost" style={{ padding:'0.3rem 0.5rem', minWidth:'unset' }} onClick={cancelEdit}>
                              <FiX size={13} />
                            </button>
                          </div>
                        ) : (
                          <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:'0.4rem' }}>
                            <span style={{
                              fontSize:'1.1rem', fontWeight:800,
                              color: p.stock === 0 ? '#f87171' : p.stock <= LOW_STOCK ? '#f59e0b' : 'var(--ab-text)',
                            }}>
                              {p.stock}
                            </span>
                            <button
                              title="Edit stock"
                              onClick={() => startEdit(p)}
                              style={{ background:'none', border:'none', cursor:'pointer', color:'var(--ab-text-faint)', padding:'0.15rem', opacity:0.6, transition:'opacity 0.15s' }}
                              onMouseEnter={e => e.currentTarget.style.opacity = 1}
                              onMouseLeave={e => e.currentTarget.style.opacity = 0.6}
                            >
                              <FiEdit3 size={13} />
                            </button>
                          </div>
                        )}
                      </td>

                      {/* Quick +/- buttons */}
                      <td>
                        <div style={{ display:'flex', gap:'0.4rem', justifyContent:'center' }}>
                          <button
                            title="Remove 1"
                            disabled={isSaving || p.stock === 0}
                            onClick={() => quickAdjust(p._id, 'subtract', 1)}
                            style={{ width:30, height:30, borderRadius:8, border:'1.5px solid var(--ab-border)', background:'var(--ab-tag-bg)', cursor:'pointer', color:'#f87171', fontWeight:700, display:'flex', alignItems:'center', justifyContent:'center', transition:'all 0.15s' }}
                          >
                            {isSaving ? '…' : <FiMinus size={13} />}
                          </button>
                          <button
                            title="Add 1"
                            disabled={isSaving}
                            onClick={() => quickAdjust(p._id, 'add', 1)}
                            style={{ width:30, height:30, borderRadius:8, border:'1.5px solid var(--ab-border)', background:'var(--ab-tag-bg)', cursor:'pointer', color:'#22c55e', fontWeight:700, display:'flex', alignItems:'center', justifyContent:'center', transition:'all 0.15s' }}
                          >
                            {isSaving ? '…' : <FiPlus size={13} />}
                          </button>
                          <button
                            title="Add 10"
                            disabled={isSaving}
                            onClick={() => quickAdjust(p._id, 'add', 10)}
                            style={{ padding:'0 0.6rem', height:30, borderRadius:8, border:'1.5px solid rgba(34,197,94,0.3)', background:'rgba(34,197,94,0.07)', cursor:'pointer', color:'#22c55e', fontSize:'0.7rem', fontWeight:800, display:'flex', alignItems:'center', justifyContent:'center' }}
                          >
                            +10
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="admin-pagination">
                <div className="admin-pagination-info">
                  Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filtered.length)} of {filtered.length} products
                </div>
                <div className="admin-pagination-controls">
                  <button disabled={currentPage === 1}         onClick={() => setCurrentPage(p => p - 1)}>Previous</button>
                  <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)}>Next</button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
