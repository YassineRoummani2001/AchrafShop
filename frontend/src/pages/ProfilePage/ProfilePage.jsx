import React, { useEffect, useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useSearchParams, Link } from 'react-router-dom';
import { getProfile, updateProfile } from '../../store/slices/authSlice';
import { fetchMyOrders } from '../../store/slices/orderSlice';
import { toast } from 'react-toastify';
import {
  FiUser, FiPackage, FiHeart, FiEdit2, FiSave, FiX,
  FiMail, FiPhone, FiMapPin, FiCalendar, FiShield, FiSearch, FiChevronDown,
} from 'react-icons/fi';
import ProductCard from '../../components/ProductCard/ProductCard';
import './ProfilePage.css';

/* ═══════════════════════════════════════════════════════════
   COUNTRY CODES  (flag + dial code)
   ═══════════════════════════════════════════════════════════ */
const COUNTRY_CODES = [
  { code: 'MA', dial: '+212', name: 'Morocco', flag: '🇲🇦' },
  { code: 'US', dial: '+1',   name: 'USA',     flag: '🇺🇸' },
  { code: 'GB', dial: '+44',  name: 'UK',      flag: '🇬🇧' },
  { code: 'FR', dial: '+33',  name: 'France',  flag: '🇫🇷' },
  { code: 'DE', dial: '+49',  name: 'Germany', flag: '🇩🇪' },
  { code: 'ES', dial: '+34',  name: 'Spain',   flag: '🇪🇸' },
  { code: 'IT', dial: '+39',  name: 'Italy',   flag: '🇮🇹' },
  { code: 'SA', dial: '+966', name: 'Saudi Arabia', flag: '🇸🇦' },
  { code: 'AE', dial: '+971', name: 'UAE',     flag: '🇦🇪' },
  { code: 'DZ', dial: '+213', name: 'Algeria', flag: '🇩🇿' },
  { code: 'TN', dial: '+216', name: 'Tunisia', flag: '🇹🇳' },
  { code: 'LY', dial: '+218', name: 'Libya',   flag: '🇱🇾' },
  { code: 'EG', dial: '+20',  name: 'Egypt',   flag: '🇪🇬' },
  { code: 'TR', dial: '+90',  name: 'Turkey',  flag: '🇹🇷' },
  { code: 'NL', dial: '+31',  name: 'Netherlands', flag: '🇳🇱' },
  { code: 'BE', dial: '+32',  name: 'Belgium', flag: '🇧🇪' },
  { code: 'PT', dial: '+351', name: 'Portugal', flag: '🇵🇹' },
  { code: 'CA', dial: '+1',   name: 'Canada',  flag: '🇨🇦' },
  { code: 'AU', dial: '+61',  name: 'Australia', flag: '🇦🇺' },
  { code: 'JP', dial: '+81',  name: 'Japan',   flag: '🇯🇵' },
  { code: 'CN', dial: '+86',  name: 'China',   flag: '🇨🇳' },
  { code: 'IN', dial: '+91',  name: 'India',   flag: '🇮🇳' },
  { code: 'BR', dial: '+55',  name: 'Brazil',  flag: '🇧🇷' },
  { code: 'MX', dial: '+52',  name: 'Mexico',  flag: '🇲🇽' },
  { code: 'RU', dial: '+7',   name: 'Russia',  flag: '🇷🇺' },
  { code: 'NG', dial: '+234', name: 'Nigeria', flag: '🇳🇬' },
  { code: 'ZA', dial: '+27',  name: 'South Africa', flag: '🇿🇦' },
  { code: 'SN', dial: '+221', name: 'Senegal', flag: '🇸🇳' },
  { code: 'KE', dial: '+254', name: 'Kenya',   flag: '🇰🇪' },
  { code: 'GH', dial: '+233', name: 'Ghana',   flag: '🇬🇭' },
  { code: 'PK', dial: '+92',  name: 'Pakistan', flag: '🇵🇰' },
  { code: 'QA', dial: '+974', name: 'Qatar',   flag: '🇶🇦' },
  { code: 'KW', dial: '+965', name: 'Kuwait',  flag: '🇰🇼' },
  { code: 'LB', dial: '+961', name: 'Lebanon', flag: '🇱🇧' },
  { code: 'IQ', dial: '+964', name: 'Iraq',    flag: '🇮🇶' },
  { code: 'JO', dial: '+962', name: 'Jordan',  flag: '🇯🇴' },
  { code: 'PS', dial: '+970', name: 'Palestine', flag: '🇵🇸' },
  { code: 'SD', dial: '+249', name: 'Sudan',   flag: '🇸🇩' },
  { code: 'MR', dial: '+222', name: 'Mauritania', flag: '🇲🇷' },
  { code: 'ML', dial: '+223', name: 'Mali',    flag: '🇲🇱' },
  { code: 'CI', dial: '+225', name: "Côte d'Ivoire", flag: '🇨🇮' },
  { code: 'CM', dial: '+237', name: 'Cameroon', flag: '🇨🇲' },
];

/* ═══════════════════════════════════════════════════════════
   WORLD CITIES (major cities grouped by country)
   ═══════════════════════════════════════════════════════════ */
const WORLD_CITIES = [
  // Morocco
  'Casablanca','Rabat','Fes','Marrakech','Agadir','Tanger','Meknes','Oujda','Kenitra','Tetouan','Safi','Mohammedia','El Jadida','Beni Mellal','Errachidia','Nador','Larache','Khemisset','Settat','Berrechid',
  // Algeria
  'Algiers','Oran','Constantine','Annaba','Blida','Batna','Setif','Sidi Bel Abbes','Biskra','Tlemcen',
  // Tunisia
  'Tunis','Sfax','Sousse','Kairouan','Bizerte','Gabès','Ariana','Gafsa','Monastir','Nabeul',
  // Egypt
  'Cairo','Alexandria','Giza','Shubra','Port Said','Suez','Mansoura','Luxor','Aswan','Tanta',
  // Saudi Arabia
  'Riyadh','Jeddah','Mecca','Medina','Dammam','Taif','Tabuk','Abha','Khobar','Najran',
  // UAE
  'Dubai','Abu Dhabi','Sharjah','Ajman','Ras Al Khaimah','Fujairah','Umm Al Quwain',
  // France
  'Paris','Marseille','Lyon','Toulouse','Nice','Nantes','Bordeaux','Lille','Strasbourg','Montpellier',
  // UK
  'London','Birmingham','Manchester','Leeds','Glasgow','Sheffield','Liverpool','Bristol','Edinburgh','Leicester',
  // Germany
  'Berlin','Hamburg','Munich','Cologne','Frankfurt','Stuttgart','Düsseldorf','Dortmund','Essen','Leipzig',
  // Spain
  'Madrid','Barcelona','Valencia','Seville','Zaragoza','Málaga','Murcia','Palma','Las Palmas','Bilbao',
  // Italy
  'Rome','Milan','Naples','Turin','Palermo','Genoa','Bologna','Florence','Bari','Catania',
  // Turkey
  'Istanbul','Ankara','Izmir','Bursa','Adana','Gaziantep','Konya','Mersin','Antalya','Diyarbakir',
  // USA
  'New York','Los Angeles','Chicago','Houston','Phoenix','Philadelphia','San Antonio','San Diego','Dallas','San Jose','Austin','Jacksonville','Fort Worth','Columbus','Charlotte',
  // Canada
  'Toronto','Montreal','Vancouver','Calgary','Edmonton','Ottawa','Winnipeg','Quebec City','Hamilton','Kitchener',
  // Brazil
  'São Paulo','Rio de Janeiro','Brasilia','Salvador','Fortaleza','Belo Horizonte','Manaus','Curitiba','Recife','Porto Alegre',
  // India
  'Mumbai','Delhi','Bangalore','Hyderabad','Ahmedabad','Chennai','Kolkata','Surat','Pune','Jaipur',
  // China
  'Beijing','Shanghai','Guangzhou','Shenzhen','Tianjin','Wuhan','Chengdu','Nanjing','Xi\'an','Hangzhou',
  // Japan
  'Tokyo','Osaka','Nagoya','Sapporo','Fukuoka','Kobe','Kawasaki','Kyoto','Saitama','Hiroshima',
  // Russia
  'Moscow','Saint Petersburg','Novosibirsk','Yekaterinburg','Nizhny Novgorod','Kazan','Chelyabinsk','Omsk','Samara','Rostov-on-Don',
  // Nigeria
  'Lagos','Kano','Ibadan','Abuja','Port Harcourt','Benin City','Maiduguri','Zaria',' Kaduna','Enugu',
  // South Africa
  'Johannesburg','Cape Town','Durban','Pretoria','Port Elizabeth','Bloemfontein','East London','Polokwane','Nelspruit','Kimberley',
  // Senegal
  'Dakar','Touba','Thiès','Kaolack','Saint-Louis','Ziguinchor','Diourbel','Tambacounda','Kolda','Louga',
  // Kenya
  'Nairobi','Mombasa','Kisumu','Nakuru','Eldoret','Ruiru','Kikuyu','Thika','Malindi','Kitui',
  // Pakistan
  'Karachi','Lahore','Faisalabad','Rawalpindi','Gujranwala','Multan','Hyderabad','Peshawar','Islamabad','Quetta',
  // Australia
  'Sydney','Melbourne','Brisbane','Perth','Adelaide','Gold Coast','Canberra','Newcastle','Geelong','Hobart',
  // Netherlands
  'Amsterdam','Rotterdam','The Hague','Utrecht','Eindhoven','Tilburg','Groningen','Almere','Breda','Nijmegen',
  // Belgium
  'Brussels','Antwerp','Ghent','Charleroi','Liege','Bruges','Namur','Leuven','Mons','Mechelen',
  // Portugal
  'Lisbon','Porto','Braga','Amadora','Coimbra','Funchal','Setubal','Almada','Agualva','Viseu',
  // Qatar
  'Doha','Al Rayyan','Umm Salal','Al Khor','Al Wakrah','Lusail',
  // Kuwait
  'Kuwait City','Salmiya','Hawalli','Farwaniya','Ahmadi','Jahra',
  // Iraq
  'Baghdad','Basra','Mosul','Erbil','Najaf','Karbala','Kirkuk','Sulaymaniyah','Ramadi','Fallujah',
  // Lebanon
  'Beirut','Tripoli','Sidon','Tyre','Jounieh','Zahle','Baalbek',
  // Jordan
  'Amman','Zarqa','Irbid','Russeifa','Aqaba','Madaba','Karak','Jerash',
  // Libya
  'Tripoli','Benghazi','Misrata','Tarhuna','Al Khums','Zawiya','Zaïda','Ajdabiya','Sirte','Derna',
];
const SORTED_CITIES = [...new Set(WORLD_CITIES)].sort();

const STATUS_BADGE = {
  pending:    'badge-warning',
  processing: 'badge-info',
  shipped:    'badge-accent',
  delivered:  'badge-success',
  cancelled:  'badge-error',
};

/* ═══════════════════════════════════════════════════════════
   Phone input with country code selector
   ═══════════════════════════════════════════════════════════ */
function PhoneInput({ value, onChange }) {
  // Split stored value like "+212612345678" into dial + number
  const findDial = (val) => COUNTRY_CODES.find(c => val?.startsWith(c.dial)) || COUNTRY_CODES[0];
  const [selected, setSelected] = useState(() => findDial(value));
  const [number,   setNumber]   = useState(() => (value || '').replace(findDial(value).dial, '').trim());
  const [open,     setOpen]     = useState(false);
  const [search,   setSearch]   = useState('');
  const ref = useRef(null);

  // Close on outside click
  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Sync to parent form
  useEffect(() => {
    onChange(selected.dial + number.replace(/\s/g,''));
  }, [selected, number]); // eslint-disable-line

  const filtered = search
    ? COUNTRY_CODES.filter(c => c.name.toLowerCase().includes(search.toLowerCase()) || c.dial.includes(search))
    : COUNTRY_CODES;

  return (
    <div style={{ display:'flex', gap:'0.5rem', position:'relative' }} ref={ref}>
      {/* Dial code button */}
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        style={{
          display:'flex', alignItems:'center', gap:'0.4rem',
          padding:'0 0.75rem', height:44, borderRadius:'var(--radius-sm)',
          border:'1.5px solid var(--border)', background:'var(--surface-2)',
          cursor:'pointer', fontSize:'0.9rem', whiteSpace:'nowrap', flexShrink:0,
          minWidth:96, justifyContent:'space-between',
        }}
      >
        <span>{selected.flag} {selected.dial}</span>
        <FiChevronDown size={13} style={{ opacity:0.6 }} />
      </button>

      {/* Dropdown */}
      {open && (
        <div style={{
          position:'absolute', top:'calc(100% + 4px)', left:0,
          background:'var(--surface)', border:'1px solid var(--border)',
          borderRadius:'var(--radius)', boxShadow:'var(--shadow-xl)',
          zIndex:500, width:240, maxHeight:260, display:'flex', flexDirection:'column',
          overflow:'hidden',
        }}>
          <div style={{ padding:'0.5rem', borderBottom:'1px solid var(--border)', display:'flex', alignItems:'center', gap:'0.4rem' }}>
            <FiSearch size={13} style={{ color:'var(--text-muted)', flexShrink:0 }} />
            <input
              autoFocus
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search country…"
              style={{ border:'none', outline:'none', background:'transparent', fontSize:'0.85rem', flex:1, color:'var(--text)' }}
            />
          </div>
          <div style={{ overflowY:'auto', flex:1 }}>
            {filtered.map(c => (
              <button
                key={c.code}
                type="button"
                onClick={() => { setSelected(c); setOpen(false); setSearch(''); }}
                style={{
                  display:'flex', alignItems:'center', gap:'0.6rem',
                  width:'100%', padding:'0.5rem 0.75rem', border:'none',
                  background: c.code === selected.code ? 'var(--accent-light)' : 'transparent',
                  color: c.code === selected.code ? 'var(--accent-hover)' : 'var(--text)',
                  cursor:'pointer', fontSize:'0.85rem', textAlign:'left',
                }}
              >
                <span>{c.flag}</span>
                <span style={{ flex:1 }}>{c.name}</span>
                <span style={{ color:'var(--text-muted)', fontSize:'0.8rem' }}>{c.dial}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Number input */}
      <input
        type="tel"
        value={number}
        onChange={e => setNumber(e.target.value.replace(/[^0-9 ]/g,''))}
        placeholder="6XX XXX XXX"
        className="form-input"
        style={{ flex:1 }}
      />
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   City searchable select
   ═══════════════════════════════════════════════════════════ */
function CitySelect({ value, onChange }) {
  const [open,   setOpen]   = useState(false);
  const [search, setSearch] = useState('');
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const filtered = search
    ? SORTED_CITIES.filter(c => c.toLowerCase().startsWith(search.toLowerCase()))
    : SORTED_CITIES;

  return (
    <div style={{ position:'relative' }} ref={ref}>
      <button
        type="button"
        onClick={() => { setOpen(o => !o); setSearch(''); }}
        style={{
          display:'flex', alignItems:'center', justifyContent:'space-between',
          width:'100%', padding:'0 0.875rem', height:44,
          border:'1.5px solid var(--border)', borderRadius:'var(--radius-sm)',
          background:'var(--surface)', cursor:'pointer',
          fontSize:'0.95rem', color: value ? 'var(--text)' : 'var(--text-muted)',
        }}
      >
        <span><FiMapPin size={13} style={{ marginRight:'0.4rem', color:'var(--accent)' }}/>{value || 'Select city…'}</span>
        <FiChevronDown size={13} style={{ opacity:0.6, flexShrink:0 }} />
      </button>

      {open && (
        <div style={{
          position:'absolute', top:'calc(100% + 4px)', left:0, right:0,
          background:'var(--surface)', border:'1px solid var(--border)',
          borderRadius:'var(--radius)', boxShadow:'var(--shadow-xl)',
          zIndex:500, display:'flex', flexDirection:'column',
          maxHeight:260, overflow:'hidden',
        }}>
          <div style={{ padding:'0.5rem', borderBottom:'1px solid var(--border)', display:'flex', alignItems:'center', gap:'0.4rem' }}>
            <FiSearch size={13} style={{ color:'var(--text-muted)', flexShrink:0 }} />
            <input
              autoFocus
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search city…"
              style={{ border:'none', outline:'none', background:'transparent', fontSize:'0.85rem', flex:1, color:'var(--text)' }}
            />
          </div>
          <div style={{ overflowY:'auto', flex:1 }}>
            {filtered.slice(0, 100).map(city => (
              <button
                key={city}
                type="button"
                onClick={() => { onChange(city); setOpen(false); }}
                style={{
                  display:'block', width:'100%', padding:'0.5rem 0.875rem',
                  border:'none', background: city === value ? 'var(--accent-light)' : 'transparent',
                  color: city === value ? 'var(--accent-hover)' : 'var(--text)',
                  cursor:'pointer', fontSize:'0.875rem', textAlign:'left',
                }}
              >
                {city}
              </button>
            ))}
            {filtered.length === 0 && (
              <p style={{ padding:'0.75rem', color:'var(--text-muted)', fontSize:'0.85rem' }}>No city found</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function ProfilePage() {
  const dispatch = useDispatch();
  const [params]  = useSearchParams();
  const activeTab = params.get('tab') || 'profile';

  const { profile, loading: authLoading } = useSelector((s) => s.auth);
  const { myOrders, loading: ordersLoading } = useSelector((s) => s.orders);

  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: '', email: '', phone: '', city: '', address: '',
  });

  useEffect(() => {
    dispatch(getProfile());
    if (activeTab === 'orders') dispatch(fetchMyOrders());
  }, [dispatch, activeTab]);

  useEffect(() => {
    if (profile) {
      setForm({
        name:    profile.name    || '',
        email:   profile.email   || '',
        phone:   profile.phone   || '',
        city:    profile.city    || '',
        address: profile.address || '',
      });
    }
  }, [profile]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) { toast.error('Name is required'); return; }
    if (!form.email.trim()) { toast.error('Email is required'); return; }
    setSaving(true);
    const result = await dispatch(updateProfile(form));
    setSaving(false);
    if (updateProfile.fulfilled.match(result)) {
      toast.success('Profile updated successfully!');
      setEditing(false);
    } else {
      toast.error(result.payload || 'Failed to update profile');
    }
  };

  const TABS = [
    { id: 'profile', label: 'My Profile', icon: <FiUser/> },
    { id: 'orders',  label: 'My Orders',  icon: <FiPackage/> },
    { id: 'wishlist',label: 'Wishlist',   icon: <FiHeart/> },
    { id: 'security',label: 'Security',   icon: <FiShield/> },
  ];

  return (
    <div className="profile-page">
      <div className="container profile-layout">
        {/* Sidebar */}
        <aside className="profile-sidebar">
          {/* Avatar */}
          <div className="profile-avatar-block">
            <div className="profile-avatar">
              {profile?.name?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className="profile-avatar-info">
              <p className="profile-avatar-name">{profile?.name || '—'}</p>
              <p className="profile-avatar-email">{profile?.email || '—'}</p>
              {profile?.role === 'admin' && (
                <span className="badge badge-accent">Admin</span>
              )}
            </div>
          </div>

          <nav className="profile-nav">
            {TABS.map((tab) => (
              <Link
                key={tab.id}
                to={`/profile?tab=${tab.id}`}
                className={`profile-nav-item ${activeTab === tab.id ? 'active' : ''}`}
              >
                {tab.icon} {tab.label}
              </Link>
            ))}
          </nav>
        </aside>

        {/* Content */}
        <div className="profile-content">
          {/* ──── PROFILE TAB ──── */}
          {activeTab === 'profile' && (
            <div className="profile-section">
              <div className="section-top-bar">
                <h2>Personal Information</h2>
                {!editing ? (
                  <button className="btn btn-outline btn-sm" onClick={() => setEditing(true)}>
                    <FiEdit2/> Edit
                  </button>
                ) : (
                  <button className="btn btn-ghost btn-sm" onClick={() => setEditing(false)}>
                    <FiX/> Cancel
                  </button>
                )}
              </div>

              {authLoading ? (
                <div className="loading-overlay"><div className="spinner"/></div>
              ) : (
                <form onSubmit={handleSave} className="profile-form">
                  <div className="form-grid-2">
                    {/* Name */}
                    <div className="form-group">
                      <label className="form-label">
                        <FiUser className="label-icon"/> Full Name
                      </label>
                      {editing ? (
                        <input
                          type="text" name="name"
                          value={form.name} onChange={handleChange}
                          className="form-input" required
                          placeholder="Your full name"
                        />
                      ) : (
                        <p className="profile-value">{profile?.name || <em className="empty-val">Not set</em>}</p>
                      )}
                    </div>

                    {/* Email */}
                    <div className="form-group">
                      <label className="form-label">
                        <FiMail className="label-icon"/> Email Address
                      </label>
                      {editing ? (
                        <input
                          type="email" name="email"
                          value={form.email} onChange={handleChange}
                          className="form-input" required
                          placeholder="you@gmail.com"
                        />
                      ) : (
                        <p className="profile-value">{profile?.email || <em className="empty-val">Not set</em>}</p>
                      )}
                    </div>

                    {/* Phone */}
                    <div className="form-group">
                      <label className="form-label">
                        <FiPhone className="label-icon"/> Phone Number
                      </label>
                      {editing ? (
                        <PhoneInput
                          value={form.phone}
                          onChange={(v) => setForm(p => ({ ...p, phone: v }))}
                        />
                      ) : (
                        <p className="profile-value">{profile?.phone || <em className="empty-val">Not set</em>}</p>
                      )}
                    </div>

                    {/* City */}
                    <div className="form-group">
                      <label className="form-label">
                        <FiMapPin className="label-icon"/> City
                      </label>
                      {editing ? (
                        <CitySelect
                          value={form.city}
                          onChange={(v) => setForm(p => ({ ...p, city: v }))}
                        />
                      ) : (
                        <p className="profile-value">{profile?.city || <em className="empty-val">Not set</em>}</p>
                      )}
                    </div>

                    {/* Address — full width */}
                    <div className="form-group full-width">
                      <label className="form-label">
                        <FiMapPin className="label-icon"/> Full Address
                      </label>
                      {editing ? (
                        <textarea
                          name="address"
                          value={form.address} onChange={handleChange}
                          className="form-input profile-textarea"
                          placeholder="Street, neighbourhood, postal code..."
                          rows={3}
                        />
                      ) : (
                        <p className="profile-value">{profile?.address || <em className="empty-val">Not set</em>}</p>
                      )}
                    </div>

                    {/* Member since */}
                    <div className="form-group">
                      <label className="form-label">
                        <FiCalendar className="label-icon"/> Member Since
                      </label>
                      <p className="profile-value">
                        {profile?.createdAt
                          ? new Date(profile.createdAt).toLocaleDateString('en-GB', { year:'numeric', month:'long', day:'numeric' })
                          : '—'}
                      </p>
                    </div>
                  </div>

                  {editing && (
                    <div className="form-actions">
                      <button type="submit" className="btn btn-accent" disabled={saving}>
                        {saving ? <span className="spinner spinner-sm"/> : <><FiSave/> Save Changes</>}
                      </button>
                      <button type="button" className="btn btn-ghost" onClick={() => setEditing(false)}>
                        Cancel
                      </button>
                    </div>
                  )}
                </form>
              )}
            </div>
          )}

          {/* ──── ORDERS TAB ──── */}
          {activeTab === 'orders' && (
            <div className="profile-section">
              <h2>Order History</h2>
              {ordersLoading ? (
                <div className="loading-overlay"><div className="spinner"/></div>
              ) : myOrders.length === 0 ? (
                <div className="empty-state">
                  <FiPackage size={48}/>
                  <h3>No orders yet</h3>
                  <p>You haven't placed any orders yet.</p>
                  <Link to="/shop" className="btn btn-accent">Start Shopping</Link>
                </div>
              ) : (
                <div className="orders-list">
                  {myOrders.map((order) => (
                    <div key={order._id} className="order-card">
                      <div className="order-card-header">
                        <div>
                          <p className="order-id">Order #{order._id.slice(-8).toUpperCase()}</p>
                          <p className="order-date">
                            {new Date(order.createdAt).toLocaleDateString('en-GB', {
                              day:'2-digit', month:'short', year:'numeric',
                            })}
                          </p>
                        </div>
                        <div className="order-header-right">
                          <span className={`badge ${STATUS_BADGE[order.orderStatus] || 'badge-primary'}`}>
                            {order.orderStatus}
                          </span>
                          <p className="order-total">${order.totalPrice?.toFixed(2)}</p>
                        </div>
                      </div>

                      {/* ── Status Stepper ─────────────────────── */}
                      <OrderStatusStepper status={order.orderStatus} />

                      <div className="order-items-preview">
                        {order.orderItems?.slice(0, 3).map((item, i) => (
                          <div key={i} className="order-item-thumb">
                            <img
                              src={item.image || 'https://placehold.co/50x60?text=?'}
                              alt={item.name}
                              onError={(e) => { e.target.src = 'https://placehold.co/50x60?text=?'; }}
                            />
                            <div className="order-item-info">
                              <p className="order-item-name">{item.name}</p>
                              <p className="order-item-meta">
                                {item.size && `Size: ${item.size}`} · Qty: {item.quantity} · ${item.price?.toFixed(2)}
                              </p>
                            </div>
                          </div>
                        ))}
                        {order.orderItems?.length > 3 && (
                          <p className="order-more">+{order.orderItems.length - 3} more item(s)</p>
                        )}
                      </div>

                      <div className="order-card-footer">
                        <div className="order-shipping">
                          <FiMapPin size={13}/>
                          {order.shippingInfo?.city}, {order.shippingInfo?.address?.slice(0, 40)}
                        </div>
                        <div style={{ display:'flex', gap:'0.5rem', alignItems:'center' }}>
                          <span style={{ fontSize:'0.78rem', color: order.isPaid ? '#22c55e' : '#f87171', fontWeight:600 }}>
                            {order.isPaid ? '✓ Paid' : '✗ COD'}
                          </span>
                          <Link to={`/order-confirmation/${order._id}`} className="btn btn-outline btn-sm">
                            View Details
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ──── WISHLIST TAB ──── */}
          {activeTab === 'wishlist' && (
            <div className="profile-section">
              <h2>Wishlist</h2>
              {profile?.wishlist?.length === 0 || !profile?.wishlist ? (
                <div className="empty-state">
                  <FiHeart size={48}/>
                  <h3>Your wishlist is empty</h3>
                  <p>Save items you love while browsing.</p>
                  <Link to="/shop" className="btn btn-accent">Browse Shop</Link>
                </div>
              ) : (
                <div className="products-grid" style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(220px, 1fr))', gap:'1.5rem', marginTop:'1.5rem' }}>
                  {profile.wishlist.map(product => (
                    <ProductCard key={product._id} product={product} />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ──── SECURITY TAB ──── */}
          {activeTab === 'security' && (
            <div className="profile-section">
              <h2>Security</h2>
              <ChangePasswordForm />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ── Order Status Stepper ───────────────────────────────────────────────── */
const STEPS = [
  { key: 'pending',    label: 'Order Placed', icon: '🛒' },
  { key: 'processing', label: 'Processing',   icon: '⚙️' },
  { key: 'shipped',    label: 'Shipped',       icon: '🚚' },
  { key: 'delivered',  label: 'Delivered',     icon: '✅' },
];

function OrderStatusStepper({ status }) {
  if (status === 'cancelled') {
    return (
      <div className="order-stepper">
        <div className="order-stepper-cancelled">
          <span>❌</span> Order Cancelled
        </div>
      </div>
    );
  }
  const currentIdx = STEPS.findIndex((s) => s.key === status);
  return (
    <div className="order-stepper">
      {STEPS.map((step, idx) => {
        const done    = idx < currentIdx;
        const current = idx === currentIdx;
        return (
          <React.Fragment key={step.key}>
            <div className={`stepper-step ${done ? 'done' : ''} ${current ? 'current' : ''}`}>
              <div className="stepper-dot">
                {done ? '✓' : <span>{step.icon}</span>}
              </div>
              <span className="stepper-label">{step.label}</span>
            </div>
            {idx < STEPS.length - 1 && (
              <div className={`stepper-line ${done ? 'done' : ''}`} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

/* Change Password sub-component */
function ChangePasswordForm() {
  const [form, setForm]   = useState({ currentPassword:'', newPassword:'', confirmNew:'' });
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};
    if (!form.currentPassword) e.currentPassword = 'Current password is required';
    if (!form.newPassword) e.newPassword = 'New password is required';
    else if (form.newPassword.length < 6) e.newPassword = 'Must be at least 6 characters';
    if (form.newPassword !== form.confirmNew) e.confirmNew = 'Passwords do not match';
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setSaving(true);
    try {
      const api = (await import('../../utils/api')).default;
      await api.put('/auth/change-password', {
        currentPassword: form.currentPassword,
        newPassword: form.newPassword,
      });
      toast.success('Password changed successfully!');
      setForm({ currentPassword:'', newPassword:'', confirmNew:'' });
    } catch (err) {
      toast.error(err.message || 'Failed to change password');
    }
    setSaving(false);
  };

  return (
    <form onSubmit={handleSubmit} className="profile-form security-form">
      <div className="security-notice">
        <FiShield/> Choose a strong password you don't use elsewhere.
      </div>
      {['currentPassword', 'newPassword', 'confirmNew'].map((field) => (
        <div key={field} className="form-group">
          <label className="form-label">
            {field === 'currentPassword' ? 'Current Password' :
             field === 'newPassword'     ? 'New Password'     : 'Confirm New Password'}
          </label>
          <input
            type="password"
            name={field}
            value={form[field]}
            onChange={(e) => { setForm((p) => ({...p,[field]:e.target.value})); setErrors((p) => ({...p,[field]:''})); }}
            className={`form-input ${errors[field] ? 'input-error' : ''}`}
            placeholder="••••••••"
          />
          {errors[field] && <span className="form-error">{errors[field]}</span>}
        </div>
      ))}
      <button type="submit" className="btn btn-primary" disabled={saving}>
        {saving ? <span className="spinner spinner-sm"/> : 'Change Password'}
      </button>
    </form>
  );
}
