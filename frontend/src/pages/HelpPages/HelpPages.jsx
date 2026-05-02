import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FiMail, FiPhone, FiMapPin, FiChevronDown, FiChevronUp, FiSend, FiTruck, FiRefreshCw, FiClock, FiPackage, FiSearch } from 'react-icons/fi';
import './HelpPages.css';

/* ══════════════════════════════════════════════════════════════
   SHARED HERO BANNER
══════════════════════════════════════════════════════════════ */
function PageHero({ emoji, title, subtitle }) {
  return (
    <div className="help-hero">
      <div className="help-hero-inner">
        <span className="help-hero-emoji">{emoji}</span>
        <h1>{title}</h1>
        <p>{subtitle}</p>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   FAQ PAGE
══════════════════════════════════════════════════════════════ */
const FAQ_ITEMS = [
  { q: 'How do I place an order?', a: 'Browse our shop, add items to your cart, and proceed to checkout. You can pay by card or cash on delivery.' },
  { q: 'Can I modify or cancel my order after placing it?', a: 'You can cancel or modify your order within 1 hour of placing it by contacting our support team. Once it\'s shipped, changes are not possible.' },
  { q: 'How long does delivery take?', a: 'Standard delivery takes 3–7 business days. Express delivery (1–2 days) is available at checkout for an additional fee.' },
  { q: 'What payment methods do you accept?', a: 'We accept Visa, Mastercard, and Cash on Delivery (COD) for all orders.' },
  { q: 'Is my personal information safe?', a: 'Yes. All data is encrypted with SSL and we never share your personal information with third parties.' },
  { q: 'How do I track my order?', a: 'Go to your profile → Orders, or use our Track Order page with your order ID.' },
  { q: 'What is your return policy?', a: 'We offer a 30-day hassle-free return policy on all unworn items with original tags. See our Shipping & Returns page for details.' },
  { q: 'Do you ship internationally?', a: 'Currently we ship within the country. International shipping is coming soon!' },
];

export function FAQPage() {
  const [open, setOpen] = useState(null);
  const [search, setSearch] = useState('');
  const filtered = FAQ_ITEMS.filter(f =>
    f.q.toLowerCase().includes(search.toLowerCase()) || f.a.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="help-page">
      <PageHero emoji="❓" title="Frequently Asked Questions" subtitle="Everything you need to know about shopping with us." />

      <div className="help-container">
        <div className="faq-search-wrap">
          <FiSearch className="faq-search-icon" />
          <input
            className="faq-search"
            placeholder="Search questions…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        <div className="faq-list">
          {filtered.length === 0 ? (
            <p className="faq-empty">No results for "{search}"</p>
          ) : filtered.map((item, i) => (
            <div key={i} className={`faq-item ${open === i ? 'open' : ''}`}>
              <button className="faq-q" onClick={() => setOpen(open === i ? null : i)}>
                <span>{item.q}</span>
                {open === i ? <FiChevronUp /> : <FiChevronDown />}
              </button>
              <div className="faq-a">
                <p>{item.a}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="help-cta-box">
          <p>Still have questions?</p>
          <Link to="/contact" className="help-btn">Contact Us</Link>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   SHIPPING & RETURNS PAGE
══════════════════════════════════════════════════════════════ */
export function ShippingReturnsPage() {
  return (
    <div className="help-page">
      <PageHero emoji="🚚" title="Shipping & Returns" subtitle="Fast delivery and easy returns — always." />

      <div className="help-container">
        <div className="sr-grid">
          <div className="sr-card">
            <div className="sr-card-icon"><FiTruck /></div>
            <h3>Standard Shipping</h3>
            <p>3–7 business days</p>
            <p className="sr-price">Free on orders over $50</p>
          </div>
          <div className="sr-card">
            <div className="sr-card-icon" style={{background:'rgba(201,169,110,0.15)',color:'#c9a96e'}}><FiClock /></div>
            <h3>Express Shipping</h3>
            <p>1–2 business days</p>
            <p className="sr-price">+$9.99</p>
          </div>
          <div className="sr-card">
            <div className="sr-card-icon" style={{background:'rgba(34,197,94,0.1)',color:'#22c55e'}}><FiRefreshCw /></div>
            <h3>Free Returns</h3>
            <p>30-day window</p>
            <p className="sr-price">No questions asked</p>
          </div>
        </div>

        <div className="help-section">
          <h2>Shipping Policy</h2>
          <ul className="help-list">
            <li>Orders are processed within <strong>24 hours</strong> of placement.</li>
            <li>You'll receive an email with tracking info once your order ships.</li>
            <li>We ship Monday–Saturday (excluding public holidays).</li>
            <li>Free standard shipping is applied automatically at checkout for orders over $50.</li>
            <li>Delivery estimates begin from the day the order is shipped, not the day it's placed.</li>
          </ul>
        </div>

        <div className="help-section">
          <h2>Returns Policy</h2>
          <ul className="help-list">
            <li>Items can be returned within <strong>30 days</strong> of delivery.</li>
            <li>Items must be unworn, unwashed, and in original packaging with tags attached.</li>
            <li>Sale items are <strong>final sale</strong> and cannot be returned.</li>
            <li>Once we receive your return, refunds are processed within 5–7 business days.</li>
            <li>To initiate a return, go to your profile → Orders → Request Return.</li>
          </ul>
        </div>

        <div className="help-cta-box">
          <p>Need help with a return?</p>
          <Link to="/contact" className="help-btn">Contact Us</Link>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   SIZE GUIDE PAGE
══════════════════════════════════════════════════════════════ */
const SIZE_DATA = {
  men: [
    { size:'XS', chest:'34–36"', waist:'28–30"', hip:'34–36"' },
    { size:'S',  chest:'36–38"', waist:'30–32"', hip:'36–38"' },
    { size:'M',  chest:'38–40"', waist:'32–34"', hip:'38–40"' },
    { size:'L',  chest:'40–42"', waist:'34–36"', hip:'40–42"' },
    { size:'XL', chest:'42–44"', waist:'36–38"', hip:'42–44"' },
    { size:'XXL',chest:'44–46"', waist:'38–40"', hip:'44–46"' },
  ],
  women: [
    { size:'XS', chest:'32–33"', waist:'24–25"', hip:'34–35"' },
    { size:'S',  chest:'34–35"', waist:'26–27"', hip:'36–37"' },
    { size:'M',  chest:'36–37"', waist:'28–29"', hip:'38–39"' },
    { size:'L',  chest:'38–39"', waist:'30–31"', hip:'40–41"' },
    { size:'XL', chest:'40–41"', waist:'32–33"', hip:'42–43"' },
    { size:'XXL',chest:'42–44"', waist:'34–36"', hip:'44–46"' },
  ],
};

export function SizeGuidePage() {
  const [tab, setTab] = useState('men');
  return (
    <div className="help-page">
      <PageHero emoji="📏" title="Size Guide" subtitle="Find your perfect fit with our detailed size charts." />

      <div className="help-container">
        <div className="sg-tip-box">
          <strong>💡 Tip:</strong> When between sizes, we recommend sizing up for comfort.
        </div>

        <div className="sg-tabs">
          {['men','women'].map(t => (
            <button key={t} className={`sg-tab ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>
              {t === 'men' ? '👔 Men' : '👗 Women'}
            </button>
          ))}
        </div>

        <div className="sg-table-wrap">
          <table className="sg-table">
            <thead>
              <tr><th>Size</th><th>Chest</th><th>Waist</th><th>Hip</th></tr>
            </thead>
            <tbody>
              {SIZE_DATA[tab].map(row => (
                <tr key={row.size}>
                  <td><span className="sg-size-badge">{row.size}</span></td>
                  <td>{row.chest}</td>
                  <td>{row.waist}</td>
                  <td>{row.hip}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="help-section">
          <h2>How to Measure</h2>
          <div className="sg-measure-grid">
            {[
              { label: 'Chest', emoji: '📐', desc: 'Measure around the fullest part of your chest, keeping the tape level.' },
              { label: 'Waist', emoji: '📏', desc: 'Measure around your natural waistline, just above your belly button.' },
              { label: 'Hip',   emoji: '📐', desc: 'Measure around the fullest part of your hips and seat.' },
            ].map(m => (
              <div key={m.label} className="sg-measure-card">
                <span className="sg-measure-emoji">{m.emoji}</span>
                <h4>{m.label}</h4>
                <p>{m.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   TRACK ORDER PAGE
══════════════════════════════════════════════════════════════ */
export function TrackOrderPage() {
  const [orderId, setOrderId] = useState('');
  const [result, setResult] = useState(null);

  const STATUS_STEPS = ['pending','processing','shipped','delivered'];
  const STATUS_LABELS = { pending:'Order Placed', processing:'Processing', shipped:'Shipped', delivered:'Delivered' };
  const STATUS_EMOJIS = { pending:'📋', processing:'⚙️', shipped:'🚚', delivered:'✅' };

  const handleTrack = async (e) => {
    e.preventDefault();
    if (!orderId.trim()) return;
    try {
      const userInfo = JSON.parse(localStorage.getItem('userInfo'));
      const res = await fetch(`http://localhost:5000/api/orders/${orderId.trim()}`, {
        headers: { Authorization: `Bearer ${userInfo?.token}` }
      });
      if (!res.ok) throw new Error('Order not found');
      const data = await res.json();
      setResult(data);
    } catch {
      setResult('error');
    }
  };

  const order = result && result !== 'error' ? result : null;
  const stepIdx = order ? STATUS_STEPS.indexOf(order.orderStatus) : -1;

  return (
    <div className="help-page">
      <PageHero emoji="📦" title="Track Your Order" subtitle="Enter your Order ID to see the latest status." />

      <div className="help-container">
        <form className="track-form" onSubmit={handleTrack}>
          <div className="track-input-wrap">
            <FiPackage className="track-icon" />
            <input
              className="track-input"
              placeholder="Enter Order ID (e.g. 6630abc…)"
              value={orderId}
              onChange={e => setOrderId(e.target.value)}
            />
          </div>
          <button type="submit" className="help-btn">Track Order</button>
        </form>

        {result === 'error' && (
          <div className="track-error">❌ Order not found. Please check your Order ID or <Link to="/profile">view your orders</Link> in your profile.</div>
        )}

        {order && (
          <div className="track-result">
            <div className="track-result-header">
              <div>
                <span className="track-label">Order ID</span>
                <strong>#{order._id?.slice(-10).toUpperCase()}</strong>
              </div>
              <div>
                <span className="track-label">Status</span>
                <span className={`track-badge status-${order.orderStatus}`}>{STATUS_EMOJIS[order.orderStatus]} {order.orderStatus}</span>
              </div>
              <div>
                <span className="track-label">Total</span>
                <strong>${order.totalPrice?.toFixed(2)}</strong>
              </div>
            </div>

            <div className="track-stepper">
              {STATUS_STEPS.map((s, i) => (
                <div key={s} className={`track-step ${i <= stepIdx ? 'done' : ''} ${i === stepIdx ? 'current' : ''}`}>
                  <div className="track-step-dot">{i <= stepIdx ? '✓' : (i + 1)}</div>
                  <span className="track-step-emoji">{STATUS_EMOJIS[s]}</span>
                  <span className="track-step-label">{STATUS_LABELS[s]}</span>
                  {i < STATUS_STEPS.length - 1 && <div className="track-step-line" />}
                </div>
              ))}
            </div>

            {order.orderItems?.length > 0 && (
              <div className="track-items">
                <h4>Items in this order</h4>
                {order.orderItems.map((item, i) => (
                  <div key={i} className="track-item">
                    <img src={item.image} alt={item.name} onError={e => e.target.style.display='none'} />
                    <div>
                      <strong>{item.name}</strong>
                      <span>Qty: {item.qty} · ${item.price}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="help-cta-box" style={{marginTop:'2rem'}}>
          <p>Can't find your order?</p>
          <Link to="/profile" className="help-btn">View All Orders</Link>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   CONTACT PAGE
══════════════════════════════════════════════════════════════ */
export function ContactPage() {
  const [form, setForm] = useState({ name:'', email:'', subject:'', message:'' });
  const [sent, setSent] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSent(true);
  };

  return (
    <div className="help-page">
      <PageHero emoji="✉️" title="Contact Us" subtitle="We're here to help! Reach out and we'll get back to you within 24 hours." />

      <div className="help-container">
        <div className="contact-grid">
          {/* Contact Info */}
          <div className="contact-info">
            <h3>Get in Touch</h3>
            <div className="contact-items">
              {[
                { icon: <FiMail />, label: 'Email', value: 'support@achrafshop.com', color: '#c9a96e' },
                { icon: <FiPhone />, label: 'Phone', value: '+212 600 000 000', color: '#22c55e' },
                { icon: <FiMapPin />, label: 'Address', value: 'Casablanca, Morocco', color: '#f87171' },
                { icon: <FiClock />, label: 'Hours', value: 'Mon–Sat, 9am – 6pm', color: '#60a5fa' },
              ].map(c => (
                <div key={c.label} className="contact-item">
                  <div className="contact-item-icon" style={{color: c.color, background:`${c.color}18`}}>{c.icon}</div>
                  <div>
                    <span className="contact-item-label">{c.label}</span>
                    <strong>{c.value}</strong>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Contact Form */}
          <div className="contact-form-card">
            {sent ? (
              <div className="contact-success">
                <span className="contact-success-emoji">🎉</span>
                <h3>Message Sent!</h3>
                <p>Thank you for reaching out. We'll get back to you within 24 hours.</p>
                <button className="help-btn" onClick={() => setSent(false)}>Send Another</button>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <div className="contact-form-row">
                  <div className="contact-form-group">
                    <label>Name</label>
                    <input required placeholder="Your full name" value={form.name} onChange={e => setForm({...form, name:e.target.value})} />
                  </div>
                  <div className="contact-form-group">
                    <label>Email</label>
                    <input type="email" required placeholder="your@email.com" value={form.email} onChange={e => setForm({...form, email:e.target.value})} />
                  </div>
                </div>
                <div className="contact-form-group">
                  <label>Subject</label>
                  <select value={form.subject} onChange={e => setForm({...form, subject:e.target.value})} required>
                    <option value="">Select a topic…</option>
                    <option>Order Issue</option>
                    <option>Return / Refund</option>
                    <option>Product Question</option>
                    <option>Shipping Delay</option>
                    <option>Other</option>
                  </select>
                </div>
                <div className="contact-form-group">
                  <label>Message</label>
                  <textarea required rows={5} placeholder="Describe your issue or question…" value={form.message} onChange={e => setForm({...form, message:e.target.value})} />
                </div>
                <button type="submit" className="help-btn contact-submit">
                  <FiSend /> Send Message
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
