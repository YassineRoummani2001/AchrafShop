import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { FiTag, FiPlus, FiEdit2, FiTrash2, FiX, FiSearch, FiUploadCloud, FiToggleLeft, FiToggleRight } from 'react-icons/fi';
import api from '../../utils/api';
import { toast } from 'react-toastify';
import '../../components/AdminLayout/AdminLayout.css';

const EMPTY = { name: '', logo: '', website: '', active: true, order: 0 };

export default function AdminBrands() {
  const [brands,     setBrands]     = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [modal,      setModal]      = useState(false);
  const [form,       setForm]       = useState(EMPTY);
  const [editId,     setEditId]     = useState(null);
  const [saving,     setSaving]     = useState(false);
  const [confirmDel, setConfirmDel] = useState(null);
  const [uploading,  setUploading]  = useState(false);
  const [search,     setSearch]     = useState('');
  const fileRef = useRef(null);

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/brands?all=true');
      setBrands(data.data);
    } catch { toast.error('Failed to load brands'); }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const openAdd = () => { setForm(EMPTY); setEditId(null); setModal(true); };
  const openEdit = (b) => {
    setForm({ name: b.name, logo: b.logo || '', website: b.website || '', active: b.active, order: b.order || 0 });
    setEditId(b._id);
    setModal(true);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(p => ({ ...p, [name]: type === 'checkbox' ? checked : value }));
  };

  /* Upload logo */
  const handleLogoUpload = async (file) => {
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { toast.error('Max 5MB'); return; }
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('image', file);
      const token = JSON.parse(localStorage.getItem('userInfo'))?.token || '';
      const { data } = await axios.post('http://localhost:5000/api/upload', fd, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setForm(p => ({ ...p, logo: data.url }));
      toast.success('Logo uploaded!');
    } catch { toast.error('Upload failed'); }
    setUploading(false);
  };

  /* Toggle active quickly from table */
  const toggleActive = async (brand) => {
    try {
      await api.put(`/brands/${brand._id}`, { active: !brand.active });
      setBrands(prev => prev.map(b => b._id === brand._id ? { ...b, active: !b.active } : b));
    } catch { toast.error('Update failed'); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) { toast.error('Brand name required'); return; }
    setSaving(true);
    try {
      if (editId) {
        const { data } = await api.put(`/brands/${editId}`, form);
        setBrands(prev => prev.map(b => b._id === editId ? data.data : b));
        toast.success('Brand updated!');
      } else {
        const { data } = await api.post('/brands', form);
        setBrands(prev => [...prev, data.data]);
        toast.success('Brand created!');
      }
      setModal(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error saving brand');
    }
    setSaving(false);
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/brands/${id}`);
      setBrands(prev => prev.filter(b => b._id !== id));
      setConfirmDel(null);
      toast.success('Brand deleted');
    } catch { toast.error('Failed to delete'); }
  };

  const filtered = brands.filter(b =>
    !search || b.name.toLowerCase().includes(search.toLowerCase())
  );

  /* ── Pagination ─────────────────────────────────────────────── */
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
  useEffect(() => { setCurrentPage(1); }, [search]);
  
  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const paginatedData = filtered.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div>
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Brands</h1>
          <p className="admin-page-subtitle">{brands.length} brand{brands.length !== 1 ? 's' : ''} — shown as animated strip on homepage</p>
        </div>
        <button className="btn-admin-primary" onClick={openAdd}>
          <FiPlus size={15} /> Add Brand
        </button>
      </div>

      <div className="admin-card" style={{ paddingBottom: 0 }}>
        {/* Search */}
        <div style={{ position:'relative', marginBottom:'1.25rem', maxWidth:320 }}>
          <FiSearch size={14} style={{ position:'absolute', left:'0.75rem', top:'50%', transform:'translateY(-50%)', color:'var(--ab-text-faint)' }} />
          <input
            className="admin-search"
            style={{ paddingLeft:'2rem', width:'100%', boxSizing:'border-box' }}
            placeholder="Search brands…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        {loading ? (
          <div className="admin-loading"><div className="admin-spinner" /></div>
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr><th>Logo</th><th>Brand Name</th><th>Website</th><th>Order</th><th>Active</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {paginatedData.length === 0 ? (
                  <tr><td colSpan={6}>
                    <div className="admin-empty">
                      <div className="admin-empty-icon"><FiTag /></div>
                      <p>No brands yet — add one!</p>
                    </div>
                  </td></tr>
                ) : paginatedData.map(b => (
                  <tr key={b._id}>
                    <td>
                      {b.logo ? (
                        <img src={b.logo} alt={b.name}
                          style={{ height:36, maxWidth:80, objectFit:'contain', borderRadius:6, background:'var(--ab-tag-bg)', padding:'2px 6px' }}
                          onError={e => { e.target.style.display='none'; }}
                        />
                      ) : (
                        <div style={{ width:40, height:36, borderRadius:6, background:'var(--ab-tag-bg)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.2rem' }}>
                          🏷️
                        </div>
                      )}
                    </td>
                    <td style={{ fontWeight:700, color:'var(--ab-text)' }}>{b.name}</td>
                    <td>
                      {b.website
                        ? <a href={b.website} target="_blank" rel="noreferrer" style={{ color:'var(--ab-gold)', fontSize:'0.8rem' }}>{b.website}</a>
                        : <span style={{ color:'var(--ab-text-faint)', fontSize:'0.8rem' }}>—</span>}
                    </td>
                    <td style={{ color:'var(--ab-text-muted)' }}>{b.order}</td>
                    <td>
                      <button
                        onClick={() => toggleActive(b)}
                        style={{ background:'none', border:'none', cursor:'pointer', color: b.active ? '#22c55e' : 'var(--ab-text-faint)', fontSize:'1.4rem', padding:0 }}
                        title={b.active ? 'Click to hide' : 'Click to show'}
                      >
                        {b.active ? <FiToggleRight size={24} /> : <FiToggleLeft size={24} />}
                      </button>
                    </td>
                    <td>
                      <div style={{ display:'flex', gap:'0.5rem' }}>
                        <button className="btn-admin-ghost" style={{ padding:'0.35rem 0.6rem' }} onClick={() => openEdit(b)}><FiEdit2 size={13} /></button>
                        <button className="btn-admin-danger" style={{ padding:'0.35rem 0.6rem' }} onClick={() => setConfirmDel(b)}><FiTrash2 size={13} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
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

      {/* ── Add/Edit Modal ── */}
      {modal && (
        <div className="admin-modal-overlay" onClick={e => e.target === e.currentTarget && setModal(false)}>
          <div className="admin-modal" style={{ maxWidth:480 }}>
            <div className="admin-modal-header">
              <h3 className="admin-modal-title">{editId ? '✏️ Edit Brand' : '➕ Add Brand'}</h3>
              <button className="btn-admin-ghost" style={{ padding:'0.3rem' }} onClick={() => setModal(false)}><FiX size={16} /></button>
            </div>

            <form onSubmit={handleSubmit}>
              {/* Name */}
              <div className="admin-form-group">
                <label className="admin-form-label">Brand Name *</label>
                <input className="admin-form-input" name="name" value={form.name} onChange={handleChange} required placeholder="e.g. Nike" />
              </div>

              {/* Logo */}
              <div className="admin-form-group">
                <label className="admin-form-label">Logo</label>
                <input ref={fileRef} type="file" accept="image/*" style={{ display:'none' }} onChange={e => handleLogoUpload(e.target.files[0])} onClick={e => { e.target.value=''; }} />
                <div style={{ display:'flex', gap:'0.5rem', alignItems:'flex-start', flexDirection:'column' }}>
                  {/* Preview */}
                  {form.logo && (
                    <div style={{ padding:'0.5rem 1rem', background:'var(--ab-tag-bg)', borderRadius:8, border:'1px solid var(--ab-border)' }}>
                      <img src={form.logo} alt="logo preview" style={{ height:40, maxWidth:120, objectFit:'contain' }} onError={e => e.target.style.display='none'} />
                    </div>
                  )}
                  <div style={{ display:'flex', gap:'0.5rem', width:'100%' }}>
                    <input className="admin-form-input" name="logo" value={form.logo} onChange={handleChange} placeholder="https://... or upload" style={{ flex:1 }} />
                    <button type="button" className="btn-admin-ghost" onClick={() => fileRef.current?.click()} disabled={uploading}>
                      {uploading ? '…' : <><FiUploadCloud size={13} /> Upload</>}
                    </button>
                  </div>
                </div>
              </div>

              {/* Website */}
              <div className="admin-form-group">
                <label className="admin-form-label">Website URL</label>
                <input className="admin-form-input" name="website" value={form.website} onChange={handleChange} placeholder="https://brand.com" />
              </div>

              {/* Order + Active */}
              <div className="admin-form-row">
                <div className="admin-form-group">
                  <label className="admin-form-label">Display Order</label>
                  <input className="admin-form-input" name="order" type="number" value={form.order} onChange={handleChange} placeholder="0" />
                </div>
                <div className="admin-form-group" style={{ justifyContent:'flex-end' }}>
                  <label className="admin-form-label">Visible on Homepage</label>
                  <div style={{ display:'flex', alignItems:'center', gap:'0.6rem', paddingTop:'0.4rem' }}>
                    <input type="checkbox" id="brandActive" name="active" checked={form.active} onChange={handleChange}
                      style={{ width:16, height:16, accentColor:'var(--ab-gold)' }} />
                    <label htmlFor="brandActive" style={{ fontSize:'0.875rem', color:'var(--ab-text-muted)', cursor:'pointer' }}>
                      {form.active ? '✅ Active' : '❌ Hidden'}
                    </label>
                  </div>
                </div>
              </div>

              <div className="admin-modal-actions">
                <button type="button" className="btn-admin-ghost" onClick={() => setModal(false)}>Cancel</button>
                <button type="submit" className="btn-admin-primary" disabled={saving}>
                  {saving ? 'Saving…' : editId ? 'Save Changes' : 'Add Brand'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete confirm */}
      {confirmDel && (
        <div className="admin-modal-overlay">
          <div className="admin-modal" style={{ maxWidth:380, textAlign:'center' }}>
            <div style={{ fontSize:'3rem', marginBottom:'0.5rem' }}>🗑️</div>
            <h3 style={{ fontWeight:700, color:'var(--ab-text)', marginBottom:'0.5rem' }}>Delete "{confirmDel.name}"?</h3>
            <p style={{ color:'var(--ab-text-muted)', marginBottom:'1.5rem', fontSize:'0.9rem' }}>This will remove the brand from the homepage.</p>
            <div style={{ display:'flex', gap:'0.75rem', justifyContent:'center' }}>
              <button className="btn-admin-ghost" onClick={() => setConfirmDel(null)}>Cancel</button>
              <button className="btn-admin-danger" onClick={() => handleDelete(confirmDel._id)}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
