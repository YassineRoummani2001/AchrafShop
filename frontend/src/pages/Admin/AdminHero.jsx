import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { FiImage, FiPlus, FiEdit2, FiTrash2, FiX, FiUploadCloud, FiToggleLeft, FiToggleRight } from 'react-icons/fi';
import api from '../../utils/api';
import { toast } from 'react-toastify';
import '../../components/AdminLayout/AdminLayout.css';

const EMPTY = { title: '', subtitle: '', image: '', buttonText: 'Shop Now', buttonLink: '/products', active: true, order: 0 };

export default function AdminHero() {
  const [slides,     setSlides]     = useState([]);
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
      const { data } = await api.get('/hero?all=true');
      setSlides(data.data);
    } catch { toast.error('Failed to load hero slides'); }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const openAdd = () => { setForm(EMPTY); setEditId(null); setModal(true); };
  const openEdit = (s) => {
    setForm({ 
      title: s.title, subtitle: s.subtitle || '', image: s.image, 
      buttonText: s.buttonText || 'Shop Now', buttonLink: s.buttonLink || '/products', 
      active: s.active, order: s.order || 0 
    });
    setEditId(s._id);
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
      setForm(p => ({ ...p, image: data.url }));
      toast.success('Image uploaded!');
    } catch { toast.error('Upload failed'); }
    setUploading(false);
  };

  const toggleActive = async (slide) => {
    try {
      await api.put(`/hero/${slide._id}`, { active: !slide.active });
      setSlides(prev => prev.map(s => s._id === slide._id ? { ...s, active: !s.active } : s));
    } catch { toast.error('Update failed'); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.image.trim()) { toast.error('Title and image are required'); return; }
    setSaving(true);
    try {
      if (editId) {
        const { data } = await api.put(`/hero/${editId}`, form);
        setSlides(prev => prev.map(s => s._id === editId ? data.data : s));
        toast.success('Slide updated!');
      } else {
        const { data } = await api.post('/hero', form);
        setSlides(prev => [...prev, data.data]);
        toast.success('Slide created!');
      }
      setModal(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error saving slide');
    }
    setSaving(false);
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/hero/${id}`);
      setSlides(prev => prev.filter(s => s._id !== id));
      setConfirmDel(null);
      toast.success('Slide deleted');
    } catch { toast.error('Failed to delete'); }
  };

  /* ── Pagination ─────────────────────────────────────────────── */
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
  const totalPages = Math.ceil(slides.length / itemsPerPage);
  const paginatedData = slides.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div>
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Hero Slider</h1>
          <p className="admin-page-subtitle">{slides.length} slide{slides.length !== 1 ? 's' : ''} — dynamic background slider on homepage</p>
        </div>
        <button className="btn-admin-primary" onClick={openAdd}>
          <FiPlus size={15} /> Add Slide
        </button>
      </div>

      <div className="admin-card" style={{ paddingBottom: 0 }}>
        {loading ? (
          <div className="admin-loading"><div className="admin-spinner" /></div>
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr><th>Image</th><th>Title & Subtitle</th><th>Button</th><th>Order</th><th>Active</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {paginatedData.length === 0 ? (
                  <tr><td colSpan={6}>
                    <div className="admin-empty">
                      <div className="admin-empty-icon"><FiImage /></div>
                      <p>No hero slides yet — add one!</p>
                    </div>
                  </td></tr>
                ) : paginatedData.map(s => (
                  <tr key={s._id}>
                    <td>
                      <img src={s.image} alt={s.title}
                        style={{ height:50, width:90, objectFit:'cover', borderRadius:6, border:'1px solid var(--ab-border)' }}
                        onError={e => { e.target.style.display='none'; }}
                      />
                    </td>
                    <td>
                      <div style={{ fontWeight:700, color:'var(--ab-text)' }}>{s.title}</div>
                      <div style={{ fontSize:'0.75rem', color:'var(--ab-text-faint)' }}>{s.subtitle || '—'}</div>
                    </td>
                    <td>
                      <div style={{ fontSize:'0.8rem', color:'var(--ab-text-muted)' }}>{s.buttonText}</div>
                      <div style={{ fontSize:'0.7rem', color:'var(--ab-gold)' }}>{s.buttonLink}</div>
                    </td>
                    <td style={{ color:'var(--ab-text-muted)' }}>{s.order}</td>
                    <td>
                      <button
                        onClick={() => toggleActive(s)}
                        style={{ background:'none', border:'none', cursor:'pointer', color: s.active ? '#22c55e' : 'var(--ab-text-faint)', fontSize:'1.4rem', padding:0 }}
                        title={s.active ? 'Click to hide' : 'Click to show'}
                      >
                        {s.active ? <FiToggleRight size={24} /> : <FiToggleLeft size={24} />}
                      </button>
                    </td>
                    <td>
                      <div style={{ display:'flex', gap:'0.5rem' }}>
                        <button className="btn-admin-ghost" style={{ padding:'0.35rem 0.6rem' }} onClick={() => openEdit(s)}><FiEdit2 size={13} /></button>
                        <button className="btn-admin-danger" style={{ padding:'0.35rem 0.6rem' }} onClick={() => setConfirmDel(s)}><FiTrash2 size={13} /></button>
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
                  Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, slides.length)} of {slides.length} entries
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
              <h3 className="admin-modal-title">{editId ? '✏️ Edit Slide' : '➕ Add Slide'}</h3>
              <button className="btn-admin-ghost" style={{ padding:'0.3rem' }} onClick={() => setModal(false)}><FiX size={16} /></button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="admin-form-group">
                <label className="admin-form-label">Title *</label>
                <input className="admin-form-input" name="title" value={form.title} onChange={handleChange} required placeholder="e.g. Summer Collection 2026" />
              </div>

              <div className="admin-form-group">
                <label className="admin-form-label">Subtitle</label>
                <input className="admin-form-input" name="subtitle" value={form.subtitle} onChange={handleChange} placeholder="e.g. Discover our new arrivals" />
              </div>

              <div className="admin-form-group">
                <label className="admin-form-label">Background Image URL *</label>
                <input ref={fileRef} type="file" accept="image/*" style={{ display:'none' }} onChange={e => handleImageUpload(e.target.files[0])} onClick={e => { e.target.value=''; }} />
                
                {form.image && (
                  <div style={{ marginBottom:'0.5rem', borderRadius:8, overflow:'hidden', border:'1px solid var(--ab-border)', aspectRatio:'21/9' }}>
                    <img src={form.image} alt="preview" style={{ width:'100%', height:'100%', objectFit:'cover' }} onError={e => e.target.style.display='none'} />
                  </div>
                )}
                
                <div style={{ display:'flex', gap:'0.5rem', width:'100%' }}>
                  <input className="admin-form-input" name="image" value={form.image} onChange={handleChange} placeholder="https://... or click upload" style={{ flex:1 }} required />
                  <button type="button" className="btn-admin-ghost" onClick={() => fileRef.current?.click()} disabled={uploading}>
                    {uploading ? '…' : <><FiUploadCloud size={13} /> Upload</>}
                  </button>
                </div>
              </div>

              <div className="admin-form-row">
                <div className="admin-form-group">
                  <label className="admin-form-label">Button Text</label>
                  <input className="admin-form-input" name="buttonText" value={form.buttonText} onChange={handleChange} placeholder="Shop Now" />
                </div>
                <div className="admin-form-group">
                  <label className="admin-form-label">Button Link</label>
                  <input className="admin-form-input" name="buttonLink" value={form.buttonLink} onChange={handleChange} placeholder="/products?gender=women" />
                </div>
              </div>

              <div className="admin-form-row">
                <div className="admin-form-group">
                  <label className="admin-form-label">Display Order</label>
                  <input className="admin-form-input" name="order" type="number" value={form.order} onChange={handleChange} placeholder="0" />
                </div>
                <div className="admin-form-group" style={{ justifyContent:'flex-end' }}>
                  <div style={{ display:'flex', alignItems:'center', gap:'0.6rem', paddingBottom:'0.65rem' }}>
                    <input type="checkbox" id="slideActive" name="active" checked={form.active} onChange={handleChange}
                      style={{ width:16, height:16, accentColor:'var(--ab-gold)' }} />
                    <label htmlFor="slideActive" style={{ fontSize:'0.875rem', color:'var(--ab-text-muted)', cursor:'pointer' }}>
                      {form.active ? '✅ Active' : '❌ Hidden'}
                    </label>
                  </div>
                </div>
              </div>

              <div className="admin-modal-actions">
                <button type="button" className="btn-admin-ghost" onClick={() => setModal(false)}>Cancel</button>
                <button type="submit" className="btn-admin-primary" disabled={saving}>
                  {saving ? 'Saving…' : editId ? 'Save Changes' : 'Add Slide'}
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
            <h3 style={{ fontWeight:700, color:'var(--ab-text)', marginBottom:'0.5rem' }}>Delete Slide?</h3>
            <p style={{ color:'var(--ab-text-muted)', marginBottom:'1.5rem', fontSize:'0.9rem' }}>This will permanently remove the slide from the homepage.</p>
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
