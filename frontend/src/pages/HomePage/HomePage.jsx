import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchFeaturedProducts, fetchCategories } from '../../store/slices/productSlice';
import ProductCard from '../../components/ProductCard/ProductCard';
import { FiArrowRight, FiShield, FiTruck, FiRefreshCw, FiStar } from 'react-icons/fi';
import api from '../../utils/api';
import './HomePage.css';

const HERO_CATEGORIES = [
  { label: 'Men',        gender: 'men',   emoji: '👔', color: '#1e293b' },
  { label: 'Women',      gender: 'women', emoji: '👗', color: '#7c3aed' },
  { label: 'Kids',       gender: 'kids',  emoji: '🧸', color: '#0891b2' },
  { label: 'Accessories',type: 'accessories', emoji: '👜', color: '#b45309' },
];

const PERKS = [
  { icon: <FiTruck size={26}/>,     title: 'Free Shipping',    desc: 'On all orders over $50' },
  { icon: <FiRefreshCw size={26}/>, title: 'Easy Returns',     desc: '30-day hassle-free returns' },
  { icon: <FiShield size={26}/>,    title: 'Secure Payment',   desc: '100% encrypted checkout' },
  { icon: <FiStar size={26}/>,      title: 'Premium Quality',  desc: 'Curated for excellence' },
];

export default function HomePage() {
  const dispatch = useDispatch();
  const { featured, loading } = useSelector((s) => s.products);
  const [brands, setBrands] = useState([]);
  const [heroSlides, setHeroSlides] = useState([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [activeTheme, setActiveTheme] = useState(window.__ACTIVE_THEME__ || null);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    dispatch(fetchFeaturedProducts());
    dispatch(fetchCategories());
    api.get('/brands').then(({ data }) => setBrands(data.data)).catch(() => {});
    api.get('/hero').then(({ data }) => setHeroSlides(data.data)).catch(() => {});
    api.get('/stats').then(({ data }) => setStats(data.data)).catch(() => {});

    const handleThemeLoaded = (e) => setActiveTheme(e.detail);
    window.addEventListener('themeLoaded', handleThemeLoaded);
    return () => window.removeEventListener('themeLoaded', handleThemeLoaded);
  }, [dispatch]);

  // Cycle slides every 10 seconds
  useEffect(() => {
    if (heroSlides.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % heroSlides.length);
    }, 10000);
    return () => clearInterval(interval);
  }, [heroSlides]);

  const slide = heroSlides.length > 0 ? heroSlides[currentSlide] : null;

  const themeNameClass = activeTheme ? `theme-${activeTheme.name.toLowerCase().replace(' ', '-')}` : '';

  return (
    <div
      className={`home-page ${themeNameClass}`}
      style={activeTheme?.bannerImage ? {
        backgroundImage: `url(${activeTheme.bannerImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center top',
        backgroundAttachment: 'fixed',
      } : {}}
    >

      {/* ── HERO ── */}
      <section className="hero">

        {/* ══ RAMADAN THEME ══ */}
        {activeTheme?.name.toLowerCase() === 'ramadan' && (<>
          <div className="theme-layer ramadan-layer">
            <span className="th-particle" style={{left:'5%',  top:'12%', fontSize:'2.8rem', animationDelay:'0s'}}>🏮</span>
            <span className="th-particle" style={{left:'18%', top:'8%',  fontSize:'2rem',   animationDelay:'0.4s'}}>🌙</span>
            <span className="th-particle" style={{left:'32%', top:'5%',  fontSize:'1.4rem', animationDelay:'0.8s'}}>✨</span>
            <span className="th-particle" style={{right:'5%', top:'10%', fontSize:'2.8rem', animationDelay:'0.2s'}}>🏮</span>
            <span className="th-particle" style={{right:'20%',top:'7%',  fontSize:'2rem',   animationDelay:'0.6s'}}>⭐</span>
            <span className="th-particle" style={{right:'35%',top:'6%',  fontSize:'1.4rem', animationDelay:'1s'}}>🌙</span>
            <span className="th-particle" style={{left:'50%', top:'3%',  fontSize:'2.4rem', animationDelay:'0.3s'}}>☪️</span>
            <div className="ramadan-crescent">☪️</div>
            <div className="ramadan-ribbon">🌙 رمضان كريم — Ramadan Mubarak 🌙</div>
          </div>
        </>)}

        {/* ══ EID THEME ══ */}
        {activeTheme?.name.toLowerCase() === 'eid' && (<>
          <div className="theme-layer eid-layer">
            {['🎉','🌟','✨','🥳','🎊','💫','🌸','🎆','🌺','🎇'].map((e,i) => (
              <span key={i} className="th-particle eid-particle" style={{
                left: `${8 + i * 9}%`,
                top: `${5 + (i % 3) * 8}%`,
                fontSize: `${1.4 + (i % 3) * 0.5}rem`,
                animationDelay: `${i * 0.2}s`
              }}>{e}</span>
            ))}
            <div className="eid-ribbon">🎉 عيد مبارك — Eid Mubarak 🎉</div>
            <div className="eid-fireworks">
              <span className="fw fw1">✨</span>
              <span className="fw fw2">🎆</span>
              <span className="fw fw3">🎇</span>
            </div>
          </div>
        </>)}

        {/* ══ BLACK FRIDAY THEME ══ */}
        {activeTheme?.name.toLowerCase() === 'black friday' && (<>
          <div className="theme-layer bf-layer">
            <div className="bf-badge-top">🔥 BLACK FRIDAY 🔥</div>
            <div className="bf-sale-tag">UP TO<br/><strong>70% OFF</strong></div>
            {['⚡','🔥','💥','⚡','🔥','💥'].map((e,i) => (
              <span key={i} className="th-particle bf-particle" style={{
                left: `${5 + i * 16}%`,
                top: `${6 + (i % 2) * 10}%`,
                fontSize: `${1.5 + (i % 2) * 0.6}rem`,
                animationDelay: `${i * 0.15}s`
              }}>{e}</span>
            ))}
          </div>
        </>)}

        {slide ? (
          <div 
            className="hero-bg dynamic-hero-bg" 
            style={{ 
              backgroundImage: `linear-gradient(rgba(15, 17, 23, 0.7), rgba(15, 17, 23, 0.85)), url(${slide.image})` 
            }} 
            key={slide._id}
          />
        ) : (
          <div className="hero-bg" />
        )}
        
        <div className="container hero-content" key={slide ? slide._id : 'default'}>
          <span className="hero-eyebrow">{slide ? (slide.subtitle || 'Discover Our Collection') : 'New Collection · Spring 2026'}</span>
          <h1 className="hero-title font-serif">
            {slide ? (
              <span dangerouslySetInnerHTML={{ __html: slide.title.replace(/\\n/g, '<br/>').replace(/\n/g, '<br/>') }} />
            ) : (
              <>Dress Bold.<br/>Live Beautifully.</>
            )}
          </h1>
          <p className="hero-sub">
            Premium fashion for men, women, and kids — curated with care and
            crafted for the modern lifestyle.
          </p>
          <div className="hero-ctas">
            <Link to={slide ? slide.buttonLink : '/shop'} className="btn btn-accent btn-lg">
              {slide ? slide.buttonText : 'Shop Now'} <FiArrowRight />
            </Link>
            <Link to="/shop?featured=true" className="btn btn-outline btn-lg hero-outline-btn">
              Explore Featured
            </Link>
          </div>
        </div>
        
        {/* Slide Indicators */}
        {heroSlides.length > 1 && (
          <div className="hero-indicators">
            {heroSlides.map((_, i) => (
              <button 
                key={i} 
                className={`hero-indicator ${i === currentSlide ? 'active' : ''}`}
                onClick={() => setCurrentSlide(i)}
                aria-label={`Go to slide ${i + 1}`}
              />
            ))}
          </div>
        )}
      </section>

      {/* ── CATEGORIES ── */}
      <section className="section-pad">
        <div className="container">
          <div className="section-header">
            <span className="eyebrow">Browse By</span>
            <h2>Shop Every Style</h2>
          </div>
          <div className="categories-grid">
            {HERO_CATEGORIES.map((cat) => (
              <Link
                key={cat.label}
                to={cat.gender ? `/shop?gender=${cat.gender}` : `/shop?type=${cat.type}`}
                className="category-card"
                style={{ '--cat-color': cat.color }}
              >
                <span className="category-emoji">{cat.emoji}</span>
                <span className="category-label">{cat.label}</span>
                <FiArrowRight className="category-arrow" />
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURED PRODUCTS ── */}
      <section className="section-pad featured-section">
        <div className="container">
          <div className="section-header">
            <span className="eyebrow">Hand-picked</span>
            <h2>Featured Products</h2>
            <p>Discover our editors' top picks for this season.</p>
          </div>

          {loading ? (
            <div className="loading-overlay">
              <div className="spinner" />
            </div>
          ) : featured.length === 0 ? (
            <div className="empty-state">
              <p>No featured products yet. Add some via the Admin panel.</p>
            </div>
          ) : (
            <div className="products-grid">
              {featured.map((p) => <ProductCard key={p._id} product={p} />)}
            </div>
          )}

          <div className="view-all-wrap">
            <Link to="/shop" className="btn btn-outline">
              View All Products <FiArrowRight />
            </Link>
          </div>
        </div>
      </section>

      {/* ── STATS COUNTER STRIP ── */}
      <section className="stats-strip">
        <div className="container stats-grid">
          {[
            { value: stats ? `${stats.totalUsers.toLocaleString()}+` : '—', label: 'Happy Customers', emoji: '😍' },
            { value: stats ? `${stats.totalProducts}+`                    : '—', label: 'Premium Products', emoji: '🛍️' },
            { value: stats ? `${stats.totalBrands}+`                      : '—', label: 'Top Brands',       emoji: '🏆' },
            { value: stats ? `${stats.avgRating}★`                        : '—', label: 'Average Rating',   emoji: '⭐' },
          ].map((stat) => (
            <div key={stat.label} className="stat-item">
              <span className="stat-emoji">{stat.emoji}</span>
              <span className={`stat-value ${!stats ? 'stat-loading' : ''}`}>{stat.value}</span>
              <span className="stat-label">{stat.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── BRANDS MARQUEE ── */}
      {brands.length > 0 && (
        <section className="brands-section">
          <div className="container">
            <div className="section-header">
              <span className="eyebrow">Our Partners</span>
              <h2>Trusted Brands</h2>
            </div>
          </div>
          <div className="brands-marquee-wrap">
            <div className="brands-marquee">
              {/* Duplicated for seamless infinite scroll */}
              {[...brands, ...brands].map((b, i) => (
                <div key={i} className="brand-item">
                  {b.logo ? (
                    <img src={b.logo} alt={b.name}
                      onError={e => { e.target.style.display='none'; e.target.nextSibling.style.display='flex'; }}
                    />
                  ) : null}
                  <span className="brand-name-fallback" style={{ display: b.logo ? 'none' : 'flex' }}>
                    {b.name}
                  </span>
                  <span className="brand-name-tooltip">{b.name}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── PERKS BANNER ── */}
      <section className="perks-section">
        <div className="container perks-grid">
          {PERKS.map((perk) => (
            <div key={perk.title} className="perk-item">
              <div className="perk-icon">{perk.icon}</div>
              <div>
                <h4 className="perk-title">{perk.title}</h4>
                <p className="perk-desc">{perk.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA BANNER ── */}
      <section className="cta-banner">
        <div className="container cta-inner">
          <h2 className="font-serif">Ready to elevate your wardrobe?</h2>
          <p>Join thousands of happy shoppers. New arrivals every week.</p>
          <Link to="/register" className="btn btn-accent btn-lg">
            Create Free Account
          </Link>
        </div>
      </section>
    </div>
  );
}
