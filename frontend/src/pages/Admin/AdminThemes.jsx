import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { FiLayout, FiPlus, FiEdit2, FiTrash2, FiX, FiCheckCircle, FiUploadCloud } from 'react-icons/fi';
import api from '../../utils/api';
import { toast } from 'react-toastify';
import '../../components/AdminLayout/AdminLayout.css';

const EMPTY = { 
  name: '', 
  primaryColor: '#0f172a', 
  secondaryColor: '#c9a96e', 
  backgroundColor: '#ffffff', 
  fontStyle: 'Inter, sans-serif', 
  bannerImage: '', 
  isActive: false,
  startDate: '',
  endDate: ''
};

export default function AdminThemes() {
  const [themes,     setThemes]     = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [modal,      setModal]      = useState(false);
  const [form,       setForm]       = useState(EMPTY);
  const [editId,     setEditId]     = useState(null);
  const [saving,     setSaving]     = useState(false);
  const [confirmDel, setConfirmDel] = useState(null);
  const [uploading,  setUploading]  = useState(false);
  const fileRef = useRef(null);

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/themes');
      setThemes(data.data);
    } catch { toast.error('Failed to load themes'); }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const openAdd = () => { setForm(EMPTY); setEditId(null); setModal(true); };
  const openEdit = (t) => {
    setForm({ 
      name: t.name, 
      primaryColor: t.primaryColor, 
      secondaryColor: t.secondaryColor, 
      backgroundColor: t.backgroundColor, 
      fontStyle: t.fontStyle, 
      bannerImage: t.bannerImage || '', 
      isActive: t.isActive,
      startDate: t.startDate || '',
      endDate: t.endDate || ''
    });
    setEditId(t._id);
    setModal(true);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(p => ({ ...p, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleImageUpload = async (file) => {
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
      setForm(p => ({ ...p, bannerImage: data.url }));
      toast.success('Image uploaded!');
    } catch { toast.error('Upload failed'); }
    setUploading(false);
  };

  const activateTheme = async (id) => {
    try {
      await api.patch(`/themes/${id}/activate`);
      setThemes(prev => prev.map(t => ({ ...t, isActive: t._id === id })));
      toast.success('Theme activated! (Reload page to see changes globally)');
      setTimeout(() => window.location.reload(), 1500); // Reload to apply theme to admin panel
    } catch { toast.error('Failed to activate theme'); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) { toast.error('Theme name is required'); return; }
    setSaving(true);
    try {
      const payload = { ...form };
      if (!payload.startDate) delete payload.startDate;
      if (!payload.endDate) delete payload.endDate;

      if (editId) {
        const { data } = await api.put(`/themes/${editId}`, payload);
        setThemes(prev => prev.map(t => t._id === editId ? data.data : (data.data.isActive ? { ...t, isActive: false } : t)));
        toast.success('Theme updated!');
      } else {
        const { data } = await api.post('/themes', payload);
        setThemes(prev => (data.data.isActive ? prev.map(t => ({...t, isActive: false})) : prev).concat(data.data));
        toast.success('Theme created!');
      }
      setModal(false);
      if (form.isActive) {
        setTimeout(() => window.location.reload(), 1500);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error saving theme');
    }
    setSaving(false);
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/themes/${id}`);
      setThemes(prev => prev.filter(t => t._id !== id));
      setConfirmDel(null);
      toast.success('Theme deleted');
    } catch { toast.error('Failed to delete'); }
  };

  /* ── Pagination ─────────────────────────────────────────────── */
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
  const totalPages = Math.ceil(themes.length / itemsPerPage);
  const paginatedData = themes.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div>
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Themes</h1>
          <p className="admin-page-subtitle">Manage store appearance for special events</p>
        </div>
        <button className="btn-admin-primary" onClick={openAdd}>
          <FiPlus size={15} /> Add Theme
        </button>
      </div>

      <div className="admin-card" style={{ paddingBottom: 0 }}>
        {loading ? (
          <div className="admin-loading"><div className="admin-spinner" /></div>
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Theme Name</th>
                  <th>Primary</th>
                  <th>Secondary</th>
                  <th>Background</th>
                  <th>Font</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedData.length === 0 ? (
                  <tr><td colSpan={7}>
                    <div className="admin-empty">
                      <div className="admin-empty-icon"><FiLayout /></div>
                      <p>No themes available.</p>
                    </div>
                  </td></tr>
                ) : paginatedData.map(t => (
                  <tr key={t._id}>
                    <td style={{ fontWeight:700, color:'var(--ab-text)', textTransform:'capitalize' }}>{t.name}</td>
                    <td>
                      <div style={{ display:'flex', alignItems:'center', gap:'0.5rem' }}>
                        <div style={{ width:16, height:16, borderRadius:4, background:t.primaryColor, border:'1px solid var(--ab-border)' }} />
                        <span>{t.primaryColor}</span>
                      </div>
                    </td>
                    <td>
                      <div style={{ display:'flex', alignItems:'center', gap:'0.5rem' }}>
                        <div style={{ width:16, height:16, borderRadius:4, background:t.secondaryColor, border:'1px solid var(--ab-border)' }} />
                        <span>{t.secondaryColor}</span>
                      </div>
                    </td>
                    <td>
                      <div style={{ display:'flex', alignItems:'center', gap:'0.5rem' }}>
                        <div style={{ width:16, height:16, borderRadius:4, background:t.backgroundColor, border:'1px solid var(--ab-border)' }} />
                        <span>{t.backgroundColor}</span>
                      </div>
                    </td>
                    <td style={{ color:'var(--ab-text-muted)' }}>{t.fontStyle.split(',')[0]}</td>
                    <td>
                      {t.isActive ? (
                        <span className="badge badge-success"><FiCheckCircle style={{marginRight:4}}/> Active</span>
                      ) : (
                        <button className="btn-admin-ghost" onClick={() => activateTheme(t._id)}>Activate</button>
                      )}
                    </td>
                    <td>
                      <div style={{ display:'flex', gap:'0.5rem' }}>
                        <button className="btn-admin-ghost" style={{ padding:'0.35rem 0.6rem' }} onClick={() => openEdit(t)}><FiEdit2 size={13} /></button>
                        <button className="btn-admin-danger" style={{ padding:'0.35rem 0.6rem' }} onClick={() => setConfirmDel(t)} disabled={t.isActive} title={t.isActive ? "Cannot delete active theme" : "Delete theme"}><FiTrash2 size={13} /></button>
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
                  Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, themes.length)} of {themes.length} entries
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
          <div className="admin-modal" style={{ maxWidth:540 }}>
            <div className="admin-modal-header">
              <h3 className="admin-modal-title">{editId ? '✏️ Edit Theme' : '➕ Add Theme'}</h3>
              <button className="btn-admin-ghost" style={{ padding:'0.3rem' }} onClick={() => setModal(false)}><FiX size={16} /></button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="admin-form-group">
                <label className="admin-form-label">Theme Name *</label>
                <input className="admin-form-input" name="name" value={form.name} onChange={handleChange} required placeholder="e.g. Ramadan, Cyber Monday" />
              </div>

              <div className="admin-form-row">
                <div className="admin-form-group">
                  <label className="admin-form-label">Start Date (Optional)</label>
                  <input type="date" className="admin-form-input" name="startDate" value={form.startDate ? form.startDate.split('T')[0] : ''} onChange={handleChange} />
                </div>
                <div className="admin-form-group">
                  <label className="admin-form-label">End Date (Optional)</label>
                  <input type="date" className="admin-form-input" name="endDate" value={form.endDate ? form.endDate.split('T')[0] : ''} onChange={handleChange} />
                </div>
              </div>

              <div className="admin-form-row">
                <div className="admin-form-group">
                  <label className="admin-form-label">Primary Color</label>
                  <div style={{ display:'flex', gap:'0.5rem', alignItems:'center' }}>
                    <input type="color" name="primaryColor" value={form.primaryColor} onChange={handleChange} style={{ width:40, height:40, padding:0, border:'none', borderRadius:8, cursor:'pointer' }} />
                    <input className="admin-form-input" name="primaryColor" value={form.primaryColor} onChange={handleChange} style={{ flex:1 }} />
                  </div>
                </div>
                <div className="admin-form-group">
                  <label className="admin-form-label">Secondary / Accent Color</label>
                  <div style={{ display:'flex', gap:'0.5rem', alignItems:'center' }}>
                    <input type="color" name="secondaryColor" value={form.secondaryColor} onChange={handleChange} style={{ width:40, height:40, padding:0, border:'none', borderRadius:8, cursor:'pointer' }} />
                    <input className="admin-form-input" name="secondaryColor" value={form.secondaryColor} onChange={handleChange} style={{ flex:1 }} />
                  </div>
                </div>
              </div>

              <div className="admin-form-row">
                <div className="admin-form-group">
                  <label className="admin-form-label">Background Color</label>
                  <div style={{ display:'flex', gap:'0.5rem', alignItems:'center' }}>
                    <input type="color" name="backgroundColor" value={form.backgroundColor} onChange={handleChange} style={{ width:40, height:40, padding:0, border:'none', borderRadius:8, cursor:'pointer' }} />
                    <input className="admin-form-input" name="backgroundColor" value={form.backgroundColor} onChange={handleChange} style={{ flex:1 }} />
                  </div>
                </div>
                <div className="admin-form-group">
                  <label className="admin-form-label">Font Family</label>
                  <select className="admin-form-input" name="fontStyle" value={form.fontStyle} onChange={handleChange}>
                    <option value="Inter, sans-serif">Inter</option>
                    <option value="Outfit, sans-serif">Outfit</option>
                    <option value="Roboto, sans-serif">Roboto</option>
                    <option value="'Playfair Display', serif">Playfair Display (Serif)</option>
                  </select>
                </div>
              </div>

              <div className="admin-form-group">
                <label className="admin-form-label">Event Banner Image (Optional)</label>
                <input ref={fileRef} type="file" accept="image/*" style={{ display:'none' }} onChange={e => handleImageUpload(e.target.files[0])} onClick={e => { e.target.value=''; }} />
                
                {form.bannerImage && (
                  <div style={{ marginBottom:'0.5rem', borderRadius:8, overflow:'hidden', border:'1px solid var(--ab-border)', maxHeight:100 }}>
                    <img src={form.bannerImage} alt="preview" style={{ width:'100%', height:'100%', objectFit:'cover' }} onError={e => e.target.style.display='none'} />
                  </div>
                )}
                
                <div style={{ display:'flex', gap:'0.5rem', width:'100%' }}>
                  <input className="admin-form-input" name="bannerImage" value={form.bannerImage} onChange={handleChange} placeholder="Image URL or upload" style={{ flex:1 }} />
                  <button type="button" className="btn-admin-ghost" onClick={() => fileRef.current?.click()} disabled={uploading}>
                    {uploading ? '…' : <><FiUploadCloud size={13} /> Upload</>}
                  </button>
                </div>
              </div>

              <div className="admin-form-group" style={{ marginTop: '1rem' }}>
                <div style={{ display:'flex', alignItems:'center', gap:'0.6rem' }}>
                  <input type="checkbox" id="themeActive" name="isActive" checked={form.isActive} onChange={handleChange}
                    style={{ width:18, height:18, accentColor:'var(--ab-gold)' }} />
                  <label htmlFor="themeActive" style={{ fontSize:'0.95rem', fontWeight:600, color:'var(--ab-text)', cursor:'pointer' }}>
                    Set as Active Theme immediately
                  </label>
                </div>
              </div>

              <div className="admin-modal-actions">
                <button type="button" className="btn-admin-ghost" onClick={() => setModal(false)}>Cancel</button>
                <button type="submit" className="btn-admin-primary" disabled={saving}>
                  {saving ? 'Saving…' : editId ? 'Save Changes' : 'Create Theme'}
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
            <h3 style={{ fontWeight:700, color:'var(--ab-text)', marginBottom:'0.5rem' }}>Delete Theme?</h3>
            <p style={{ color:'var(--ab-text-muted)', marginBottom:'1.5rem', fontSize:'0.9rem' }}>Are you sure you want to delete the "{confirmDel.name}" theme?</p>
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
