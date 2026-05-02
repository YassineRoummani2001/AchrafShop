import React, { useEffect, useState, useCallback, useRef } from 'react';
import axios from 'axios';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchAdminProducts, createAdminProduct,
  updateAdminProduct, deleteAdminProduct,
} from '../../store/slices/adminSlice';
import { FiPackage, FiPlus, FiEdit2, FiTrash2, FiSearch, FiX, FiImage, FiUploadCloud } from 'react-icons/fi';
import api from '../../utils/api';
import { toast } from 'react-toastify';
import '../../components/AdminLayout/AdminLayout.css';

/* ── Predefined options ────────────────────────────────────────── */
const CLOTHES_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL'];
const SHOE_SIZES    = ['35','36','37','38','39','40','41','42','43','44','45','46','47'];
const KIDS_SIZES    = ['2-3Y','3-4Y','4-5Y','5-6Y','7-8Y','9-10Y','11-12Y','13-14Y'];

const PRESET_COLORS = [
  { label: 'White',     hex: '#FFFFFF' },
  { label: 'Black',     hex: '#111111' },
  { label: 'Navy',      hex: '#1e3a5f' },
  { label: 'Red',       hex: '#dc2626' },
  { label: 'Blue',      hex: '#2563eb' },
  { label: 'Grey',      hex: '#6b7280' },
  { label: 'Beige',     hex: '#d4b896' },
  { label: 'Brown',     hex: '#92400e' },
  { label: 'Green',     hex: '#16a34a' },
  { label: 'Olive',     hex: '#84843a' },
  { label: 'Pink',      hex: '#ec4899' },
  { label: 'Purple',    hex: '#7c3aed' },
  { label: 'Orange',    hex: '#ea580c' },
  { label: 'Yellow',    hex: '#ca8a04' },
  { label: 'Burgundy',  hex: '#7f1d1d' },
  { label: 'Camel',     hex: '#c2966a' },
  { label: 'Gold',      hex: '#d97706' },
  { label: 'Silver',    hex: '#9ca3af' },
];

const EMPTY_FORM = {
  name: '', description: '', price: '', discountPrice: '',
  gender: 'men', type: 'clothes', stock: '', brand: '',
  isFeatured: false,
};
const EMPTY_IMAGES = ['', '', '', ''];

/* ── Tag chip component ────────────────────────────────────────── */
function TagChip({ label, selected, onClick }) {
  return (
    <button
      type="button"
      className={`tag-chip ${selected ? 'selected' : ''}`}
      onClick={onClick}
    >
      {label}
    </button>
  );
}

/* ── Color chip ────────────────────────────────────────────────── */
function ColorChip({ color, selected, onClick }) {
  return (
    <div title={color.label} style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:'0.2rem' }}>
      <button
        type="button"
        className={`color-chip ${selected ? 'selected' : ''}`}
        style={{ background: color.hex }}
        onClick={onClick}
      />
      <span className="color-chip-label">{color.label}</span>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════ */
export default function AdminProducts() {
  const dispatch = useDispatch();
  const { products, loading, actionLoading } = useSelector((s) => s.admin);

  const [search,         setSearch]         = useState('');
  const [modal,          setModal]          = useState(null);
  const [form,           setForm]           = useState(EMPTY_FORM);
  const [selectedSizes,  setSelectedSizes]  = useState([]);
  const [selectedColors, setSelectedColors] = useState([]);
  const [customColor,    setCustomColor]    = useState('');
  const [images,         setImages]         = useState(EMPTY_IMAGES);
  const [uploading,      setUploading]      = useState([false, false, false, false]);
  const [editId,         setEditId]         = useState(null);
  const [confirmDel,     setConfirmDel]     = useState(null);
  // One hidden file-input ref per slot
  const fileRefs = [useRef(null), useRef(null), useRef(null), useRef(null)];

  useEffect(() => { dispatch(fetchAdminProducts({ limit: 50 })); }, [dispatch]);

  /* sizes list based on type */
  const sizeOptions =
    form.type === 'shoes'  ? SHOE_SIZES :
    form.gender === 'kids' ? KIDS_SIZES : CLOTHES_SIZES;

  /* reset sizes when type/gender changes */
  useEffect(() => {
    setSelectedSizes([]);
  }, [form.type, form.gender]);

  /* ── Open modal helpers ─────────────────────────────────────── */
  const openAdd = () => {
    setForm(EMPTY_FORM);
    setSelectedSizes([]);
    setSelectedColors([]);
    setCustomColor('');
    setImages(EMPTY_IMAGES);
    setUploading([false, false, false, false]);
    setEditId(null);
    setModal('add');
  };

  const openEdit = (p) => {
    setForm({
      name: p.name, description: p.description || '',
      price: p.price, discountPrice: p.discountPrice || '',
      gender: p.gender, type: p.type,
      stock: p.stock, brand: p.brand || '',
      isFeatured: p.isFeatured || false,
    });
    setSelectedSizes(p.sizes || []);
    // Map saved color strings back to preset labels
    const savedColors = (p.colors || []).filter(c => PRESET_COLORS.some(pc => pc.label === c));
    const customColors = (p.colors || []).filter(c => !PRESET_COLORS.some(pc => pc.label === c));
    setSelectedColors(savedColors);
    setCustomColor(customColors.join(', '));
    const imgs = [...(p.images?.map(i => i.url) || []), '', '', '', ''].slice(0, 4);
    setImages(imgs);
    setUploading([false, false, false, false]);
    setEditId(p._id);
    setModal('edit');
  };

  /* ── Form handlers ──────────────────────────────────────────── */
  const handleChange = useCallback((e) => {
    const { name, value, type: t, checked } = e.target;
    setForm(f => ({ ...f, [name]: t === 'checkbox' ? checked : value }));
  }, []);

  const toggleSize = (s) =>
    setSelectedSizes(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]);

  const toggleColor = (label) =>
    setSelectedColors(prev => prev.includes(label) ? prev.filter(x => x !== label) : [...prev, label]);

  const clearImage = (idx) => {
    setImages(prev => prev.map((v, i) => (i === idx ? '' : v)));
  };

  /* Click on a slot → trigger its hidden file input */
  const triggerUpload = (idx) => fileRefs[idx].current?.click();

  /* Upload selected file to backend, update images[idx] with returned URL */
  const handleFileSelect = async (idx, file) => {
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { toast.error('File must be under 5 MB'); return; }
    setUploading(prev => prev.map((v, i) => (i === idx ? true : v)));
    try {
      const fd = new FormData();
      fd.append('image', file);
      const token = JSON.parse(localStorage.getItem('userInfo'))?.token || '';
      const { data } = await axios.post('http://localhost:5000/api/upload', fd, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setImages(prev => prev.map((v, i) => (i === idx ? data.url : v)));
      toast.success(`Image ${idx + 1} uploaded!`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Upload failed');
    }
    setUploading(prev => prev.map((v, i) => (i === idx ? false : v)));
  };

  /* ── Build payload ──────────────────────────────────────────── */
  const buildPayload = () => {
    const allColors = [
      ...selectedColors,
      ...customColor.split(',').map(c => c.trim()).filter(Boolean),
    ];
    return {
      name:          form.name,
      description:   form.description,
      price:         parseFloat(form.price),
      discountPrice: form.discountPrice ? parseFloat(form.discountPrice) : 0,
      gender:        form.gender,
      type:          form.type,
      stock:         parseInt(form.stock) || 0,
      brand:         form.brand,
      isFeatured:    form.isFeatured,
      sizes:         selectedSizes,
      colors:        allColors,
      images:        images.filter(Boolean).map(url => ({ url })),
    };
  };

  /* ── Submit ─────────────────────────────────────────────────── */
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.price) { toast.error('Name and price are required'); return; }
    const res = await dispatch(
      modal === 'edit'
        ? updateAdminProduct({ id: editId, ...buildPayload() })
        : createAdminProduct(buildPayload())
    );
    if (res.meta.requestStatus === 'fulfilled') {
      toast.success(modal === 'edit' ? 'Product updated!' : 'Product created!');
      setModal(null);
    } else {
      toast.error(res.payload || 'Operation failed');
    }
  };

  /* ── Delete ─────────────────────────────────────────────────── */
  const handleDelete = async (id) => {
    const res = await dispatch(deleteAdminProduct(id));
    setConfirmDel(null);
    if (res.meta.requestStatus === 'fulfilled') toast.success('Product deleted');
    else toast.error('Failed to delete');
  };

  /* ── Filter ─────────────────────────────────────────────────── */
  const filtered = products.filter((p) =>
    !search ||
    p.name?.toLowerCase().includes(search.toLowerCase()) ||
    p.brand?.toLowerCase().includes(search.toLowerCase())
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

  /* ══════════════════════════════════════════════════════════════
     RENDER
     ══════════════════════════════════════════════════════════════ */
  return (
    <div>
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Products Management</h1>
          <p className="admin-page-subtitle">{products.length} products in catalog</p>
        </div>
        <button className="btn-admin-primary" onClick={openAdd}>
          <FiPlus size={15} /> Add Product
        </button>
      </div>

      {/* ── Table card ─────────────────────────────────────────── */}
      <div className="admin-card" style={{ paddingBottom: 0 }}>
        <div style={{ display:'flex', gap:'0.75rem', marginBottom:'1.25rem', flexWrap:'wrap' }}>
          <div style={{ position:'relative', flex:1, minWidth:200 }}>
            <FiSearch size={14} style={{ position:'absolute', left:'0.75rem', top:'50%', transform:'translateY(-50%)', color:'var(--ab-text-faint)' }} />
            <input
              className="admin-search"
              style={{ paddingLeft:'2rem', width:'100%', boxSizing:'border-box' }}
              placeholder="Search by name or brand…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {loading ? (
          <div className="admin-loading"><div className="admin-spinner" /></div>
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr><th>Product</th><th>Brand</th><th>Price</th><th>Stock</th><th>Gender</th><th>Featured</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {paginatedData.length === 0 ? (
                  <tr><td colSpan={7}>
                    <div className="admin-empty">
                      <div className="admin-empty-icon"><FiPackage /></div>
                      <p>No products found</p>
                    </div>
                  </td></tr>
                ) : paginatedData.map((p) => (
                  <tr key={p._id}>
                    <td>
                      <div style={{ display:'flex', alignItems:'center', gap:'0.75rem' }}>
                        <img
                          src={p.images?.[0]?.url || ''}
                          alt={p.name}
                          style={{ width:40, height:40, objectFit:'cover', borderRadius:7, flexShrink:0, background:'var(--ab-tag-bg)', border:'1px solid var(--ab-border)' }}
                          onError={(e) => { e.target.style.display='none'; }}
                        />
                        <div>
                          <div style={{ fontWeight:600, color:'var(--ab-text)', maxWidth:210 }}>{p.name}</div>
                          <div style={{ fontSize:'0.72rem', color:'var(--ab-text-faint)', textTransform:'capitalize' }}>{p.type}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ color:'var(--ab-text-muted)' }}>{p.brand}</td>
                    <td>
                      <div style={{ fontWeight:700, color:'var(--ab-text)' }}>${Number(p.price).toFixed(2)}</div>
                      {p.discountPrice > 0 && <div style={{ fontSize:'0.75rem', color:'#f87171', textDecoration:'line-through' }}>${Number(p.discountPrice).toFixed(2)}</div>}
                    </td>
                    <td>
                      <span style={{ fontWeight:700, color: p.stock < 10 ? '#f87171' : '#22c55e' }}>{p.stock}</span>
                    </td>
                    <td>
                      <span className="status-badge role-user" style={{ textTransform:'capitalize' }}>{p.gender}</span>
                    </td>
                    <td style={{ textAlign:'center' }}>
                      <span style={{ color: p.isFeatured ? 'var(--ab-gold)' : 'var(--ab-text-faint)', fontSize:'1.1rem' }}>
                        {p.isFeatured ? '★' : '☆'}
                      </span>
                    </td>
                    <td>
                      <div style={{ display:'flex', gap:'0.5rem' }}>
                        <button className="btn-admin-ghost" onClick={() => openEdit(p)} style={{ padding:'0.35rem 0.6rem' }}><FiEdit2 size={13} /></button>
                        <button className="btn-admin-danger" onClick={() => setConfirmDel(p)} style={{ padding:'0.35rem 0.6rem' }}><FiTrash2 size={13} /></button>
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

      {/* ══════════════════════════════════════════════════════════
          Add / Edit Modal
         ══════════════════════════════════════════════════════════ */}
      {modal && (
        <div className="admin-modal-overlay" onClick={(e) => e.target === e.currentTarget && setModal(null)}>
          <div className="admin-modal">
            <div className="admin-modal-header">
              <h3 className="admin-modal-title">
                {modal === 'edit' ? '✏️ Edit Product' : '➕ Add New Product'}
              </h3>
              <button className="btn-admin-ghost" style={{ padding:'0.3rem' }} onClick={() => setModal(null)}>
                <FiX size={16} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>

              {/* Name */}
              <div className="admin-form-group">
                <label className="admin-form-label">Product Name *</label>
                <input className="admin-form-input" name="name" value={form.name} onChange={handleChange} required placeholder="e.g. Classic Oxford Shirt" />
              </div>

              {/* Description */}
              <div className="admin-form-group">
                <label className="admin-form-label">Description</label>
                <textarea className="admin-form-textarea" name="description" value={form.description} onChange={handleChange} placeholder="Product description…" rows={3} />
              </div>

              {/* Price / Sale price */}
              <div className="admin-form-row">
                <div className="admin-form-group">
                  <label className="admin-form-label">Price ($) *</label>
                  <input className="admin-form-input" name="price" type="number" step="0.01" min="0" value={form.price} onChange={handleChange} required placeholder="59.99" />
                </div>
                <div className="admin-form-group">
                  <label className="admin-form-label">Sale Price ($)</label>
                  <input className="admin-form-input" name="discountPrice" type="number" step="0.01" min="0" value={form.discountPrice} onChange={handleChange} placeholder="0.00" />
                </div>
              </div>

              {/* Gender / Type */}
              <div className="admin-form-row">
                <div className="admin-form-group">
                  <label className="admin-form-label">Gender</label>
                  <select className="admin-form-select" name="gender" value={form.gender} onChange={handleChange}>
                    <option value="men">Men</option>
                    <option value="women">Women</option>
                    <option value="kids">Kids</option>
                    <option value="unisex">Unisex</option>
                  </select>
                </div>
                <div className="admin-form-group">
                  <label className="admin-form-label">Type</label>
                  <select className="admin-form-select" name="type" value={form.type} onChange={handleChange}>
                    <option value="clothes">Clothes</option>
                    <option value="shoes">Shoes</option>
                    <option value="accessories">Accessories</option>
                  </select>
                </div>
              </div>

              {/* Brand / Stock */}
              <div className="admin-form-row">
                <div className="admin-form-group">
                  <label className="admin-form-label">Brand</label>
                  <input className="admin-form-input" name="brand" value={form.brand} onChange={handleChange} placeholder="Brand name" />
                </div>
                <div className="admin-form-group">
                  <label className="admin-form-label">Stock Quantity</label>
                  <input className="admin-form-input" name="stock" type="number" min="0" value={form.stock} onChange={handleChange} placeholder="100" />
                </div>
              </div>

              {/* ── Sizes ─────────────────────────────────────── */}
              <div className="admin-form-group">
                <label className="admin-form-label">
                  Sizes
                  {selectedSizes.length > 0 && (
                    <span style={{ marginLeft:'0.5rem', color:'var(--ab-gold)', fontWeight:700 }}>
                      ({selectedSizes.length} selected)
                    </span>
                  )}
                </label>
                <div className="tag-chip-group">
                  {sizeOptions.map((s) => (
                    <TagChip
                      key={s} label={s}
                      selected={selectedSizes.includes(s)}
                      onClick={() => toggleSize(s)}
                    />
                  ))}
                </div>
                {selectedSizes.length > 0 && (
                  <div style={{ display:'flex', gap:'0.4rem', marginTop:'0.5rem', flexWrap:'wrap' }}>
                    {selectedSizes.map(s => (
                      <span key={s} style={{
                        fontSize:'0.72rem', padding:'0.15rem 0.5rem', borderRadius:4,
                        background:'var(--ab-gold-dim)', color:'var(--ab-gold)',
                        fontWeight:700, display:'flex', alignItems:'center', gap:'0.3rem',
                      }}>
                        {s}
                        <button type="button" onClick={() => toggleSize(s)}
                          style={{ background:'none', border:'none', cursor:'pointer', color:'var(--ab-gold)', fontSize:'0.8rem', padding:0, lineHeight:1 }}>×</button>
                      </span>
                    ))}
                    <button type="button" onClick={() => setSelectedSizes([])}
                      style={{ fontSize:'0.72rem', background:'none', border:'none', cursor:'pointer', color:'var(--ab-text-faint)', padding:'0 0.25rem' }}>
                      Clear all
                    </button>
                  </div>
                )}
              </div>

              {/* ── Colors ────────────────────────────────────── */}
              <div className="admin-form-group">
                <label className="admin-form-label">
                  Colors
                  {selectedColors.length > 0 && (
                    <span style={{ marginLeft:'0.5rem', color:'var(--ab-gold)', fontWeight:700 }}>
                      ({selectedColors.length} selected)
                    </span>
                  )}
                </label>
                <div className="color-chip-group">
                  {PRESET_COLORS.map((c) => (
                    <ColorChip
                      key={c.label} color={c}
                      selected={selectedColors.includes(c.label)}
                      onClick={() => toggleColor(c.label)}
                    />
                  ))}
                </div>
                {/* Custom color text */}
                <div style={{ marginTop:'0.6rem' }}>
                  <input
                    className="admin-form-input"
                    placeholder="Other colors (comma-separated, e.g. Floral Blue, Rose Gold)"
                    value={customColor}
                    onChange={(e) => setCustomColor(e.target.value)}
                  />
                </div>
                {selectedColors.length > 0 && (
                  <div style={{ display:'flex', gap:'0.4rem', marginTop:'0.5rem', flexWrap:'wrap' }}>
                    {selectedColors.map(c => {
                      const hex = PRESET_COLORS.find(p => p.label === c)?.hex;
                      return (
                        <span key={c} style={{
                          fontSize:'0.72rem', padding:'0.15rem 0.5rem', borderRadius:4,
                          background:'var(--ab-tag-bg)', color:'var(--ab-text-muted)',
                          fontWeight:600, display:'flex', alignItems:'center', gap:'0.4rem',
                          border:'1px solid var(--ab-border-input)',
                        }}>
                          {hex && <span style={{ width:10, height:10, borderRadius:'50%', background:hex, flexShrink:0, border:'1px solid rgba(0,0,0,0.2)' }} />}
                          {c}
                          <button type="button" onClick={() => toggleColor(c)}
                            style={{ background:'none', border:'none', cursor:'pointer', color:'var(--ab-text-faint)', fontSize:'0.8rem', padding:0, lineHeight:1 }}>×</button>
                        </span>
                      );
                    })}
                    <button type="button" onClick={() => setSelectedColors([])}
                      style={{ fontSize:'0.72rem', background:'none', border:'none', cursor:'pointer', color:'var(--ab-text-faint)', padding:'0 0.25rem' }}>
                      Clear all
                    </button>
                  </div>
                )}
              </div>

              {/* ── Images (up to 4) — click to upload ─────────── */}
              <div className="admin-form-group">
                <label className="admin-form-label">
                  Product Images
                  <span style={{ color:'var(--ab-text-faint)', textTransform:'none', fontWeight:400, marginLeft:'0.4rem' }}>
                    (max 4 — click a slot to upload)
                  </span>
                </label>

                <div className="img-preview-grid">
                  {images.map((url, idx) => (
                    <React.Fragment key={idx}>
                      {/* Hidden file input */}
                      <input
                        ref={fileRefs[idx]}
                        type="file"
                        accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                        style={{ display:'none' }}
                        onChange={(e) => handleFileSelect(idx, e.target.files[0])}
                        onClick={(e) => { e.target.value = ''; }}
                      />

                      {/* Clickable slot */}
                      <div
                        className={`img-preview-slot ${url ? 'has-image' : ''}`}
                        onClick={() => !url && !uploading[idx] && triggerUpload(idx)}
                        style={{ cursor: url || uploading[idx] ? 'default' : 'pointer', position:'relative' }}
                        title={url ? '' : 'Click to upload image'}
                      >
                        {/* Uploading spinner overlay */}
                        {uploading[idx] && (
                          <div style={{
                            position:'absolute', inset:0,
                            background:'rgba(0,0,0,0.5)',
                            display:'flex', flexDirection:'column',
                            alignItems:'center', justifyContent:'center',
                            borderRadius:9, zIndex:2,
                          }}>
                            <div className="admin-spinner" style={{ width:24, height:24, borderWidth:2 }} />
                            <span style={{ fontSize:'0.65rem', color:'#fff', marginTop:'0.4rem' }}>Uploading…</span>
                          </div>
                        )}

                        {url ? (
                          /* Image preview */
                          <>
                            <img src={url} alt={`Product ${idx+1}`}
                              onError={(e) => { e.target.style.display='none'; }}
                            />
                            {/* Action buttons overlay */}
                            <div style={{
                              position:'absolute', inset:0,
                              background:'rgba(0,0,0,0)',
                              display:'flex', alignItems:'center', justifyContent:'center',
                              gap:'0.4rem', opacity:0, transition:'all 0.2s',
                              borderRadius:9,
                            }}
                              className="img-slot-hover"
                            >
                              <button
                                type="button"
                                onClick={(e) => { e.stopPropagation(); triggerUpload(idx); }}
                                style={{
                                  background:'rgba(255,255,255,0.9)', border:'none',
                                  borderRadius:6, padding:'0.3rem 0.5rem',
                                  cursor:'pointer', fontSize:'0.7rem', fontWeight:700,
                                  display:'flex', alignItems:'center', gap:'0.25rem', color:'#1e2535',
                                }}
                              >
                                <FiUploadCloud size={12} /> Change
                              </button>
                              <button
                                type="button"
                                onClick={(e) => { e.stopPropagation(); clearImage(idx); }}
                                style={{
                                  background:'rgba(239,68,68,0.9)', border:'none',
                                  borderRadius:6, padding:'0.3rem 0.5rem',
                                  cursor:'pointer', fontSize:'0.7rem', fontWeight:700,
                                  color:'#fff', display:'flex', alignItems:'center', gap:'0.25rem',
                                }}
                              >
                                <FiX size={12} /> Remove
                              </button>
                            </div>
                          </>
                        ) : (
                          /* Empty slot placeholder */
                          <div className="img-placeholder">
                            <FiUploadCloud size={22} style={{ opacity:0.5 }} />
                            <span style={{ fontSize:'0.7rem', fontWeight:600 }}>Image {idx + 1}</span>
                            <span style={{ fontSize:'0.62rem', opacity:0.6 }}>Click to upload</span>
                          </div>
                        )}
                      </div>
                    </React.Fragment>
                  ))}
                </div>
              </div>

              {/* Featured */}
              <div className="admin-form-group" style={{ flexDirection:'row', alignItems:'center', gap:'0.75rem', marginBottom:'0' }}>
                <input
                  type="checkbox" id="isFeatured" name="isFeatured"
                  checked={form.isFeatured} onChange={handleChange}
                  style={{ width:16, height:16, accentColor:'var(--ab-gold)' }}
                />
                <label htmlFor="isFeatured" style={{ fontSize:'0.875rem', color:'var(--ab-text-muted)', cursor:'pointer', userSelect:'none' }}>
                  ★ Mark as Featured Product
                </label>
              </div>

              {/* Actions */}
              <div className="admin-modal-actions">
                <button type="button" className="btn-admin-ghost" onClick={() => setModal(null)}>Cancel</button>
                <button type="submit" className="btn-admin-primary" disabled={actionLoading}>
                  {actionLoading ? 'Saving…' : modal === 'edit' ? 'Save Changes' : 'Create Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete confirm modal */}
      {confirmDel && (
        <div className="admin-modal-overlay">
          <div className="admin-modal" style={{ maxWidth:400, textAlign:'center' }}>
            <div style={{ fontSize:'3rem', marginBottom:'0.75rem' }}>🗑️</div>
            <h3 style={{ fontSize:'1.1rem', fontWeight:700, color:'var(--ab-text)', marginBottom:'0.5rem' }}>Delete Product?</h3>
            <p style={{ color:'var(--ab-text-muted)', marginBottom:'1.5rem', fontSize:'0.9rem' }}>
              Are you sure you want to delete <strong style={{ color:'var(--ab-text)' }}>{confirmDel.name}</strong>?
            </p>
            <div style={{ display:'flex', gap:'0.75rem', justifyContent:'center' }}>
              <button className="btn-admin-ghost" onClick={() => setConfirmDel(null)}>Cancel</button>
              <button className="btn-admin-danger" onClick={() => handleDelete(confirmDel._id)} disabled={actionLoading}>
                {actionLoading ? 'Deleting…' : 'Delete Product'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
