import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { login, clearError } from '../../store/slices/authSlice';
import { FiMail, FiLock, FiEye, FiEyeOff, FiArrowRight, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import './AuthPages.css';

/* ─── Slideshow data ─────────────────────────────────────────────── */
const SLIDES = [
  {
    url: 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=1200&q=80',
    title: 'New Season Arrivals',
    subtitle: 'Discover the finest fashion for men, women & kids.',
  },
  {
    url: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1200&q=80',
    title: 'Curated Collections',
    subtitle: 'Handpicked styles crafted for the modern lifestyle.',
  },
  {
    url: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200&q=80',
    title: 'Premium Quality',
    subtitle: 'Exclusive brands. Timeless elegance. Your style, elevated.',
  },
  {
    url: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1200&q=80',
    title: 'Spring / Summer 2026',
    subtitle: 'Fresh looks for every occasion — from casual to couture.',
  },
  {
    url: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=1200&q=80',
    title: 'Shop with Confidence',
    subtitle: 'Free returns · Secure checkout · Fast delivery.',
  },
];

const INTERVAL = 10000; // 10 seconds

/* ─── Slideshow panel ────────────────────────────────────────────── */
function AuthSlideshow() {
  const [current, setCurrent] = useState(0);
  const [fading,  setFading]  = useState(false);

  const goTo = useCallback((idx) => {
    setFading(true);
    setTimeout(() => {
      setCurrent(idx);
      setFading(false);
    }, 400);
  }, []);

  const prev = () => goTo((current - 1 + SLIDES.length) % SLIDES.length);
  const next = useCallback(() => goTo((current + 1) % SLIDES.length), [current, goTo]);

  /* Auto-advance */
  useEffect(() => {
    const t = setInterval(next, INTERVAL);
    return () => clearInterval(t);
  }, [next]);

  const slide = SLIDES[current];

  return (
    <div className="auth-slideshow">
      {/* Background images */}
      {SLIDES.map((s, i) => (
        <div
          key={i}
          className="slideshow-bg"
          style={{
            backgroundImage: `url(${s.url})`,
            opacity: i === current ? 1 : 0,
            transition: 'opacity 0.6s ease',
          }}
        />
      ))}

      {/* Gradient overlay */}
      <div className="slideshow-overlay" />

      {/* Content */}
      <div className={`slideshow-content ${fading ? 'slide-fade-out' : 'slide-fade-in'}`}>
        {/* Logo */}
        <Link to="/" className="slideshow-logo">
          ACHRAF<span>SHOP</span>
        </Link>

        {/* Text */}
        <div className="slideshow-text">
          <p className="slideshow-tag">✦ Premium Fashion</p>
          <h2 className="slideshow-title">{slide.title}</h2>
          <p className="slideshow-subtitle">{slide.subtitle}</p>
        </div>

        {/* Navigation */}
        <div className="slideshow-nav">
          <div className="slideshow-dots">
            {SLIDES.map((_, i) => (
              <button
                key={i}
                className={`slideshow-dot ${i === current ? 'active' : ''}`}
                onClick={() => goTo(i)}
              />
            ))}
          </div>
          <div className="slideshow-arrows">
            <button className="slideshow-arrow" onClick={prev}><FiChevronLeft size={18} /></button>
            <button className="slideshow-arrow" onClick={next}><FiChevronRight size={18} /></button>
          </div>
        </div>

        {/* Progress bar */}
        <div className="slideshow-progress-wrap">
          <div
            key={current}
            className="slideshow-progress-bar"
            style={{ animationDuration: `${INTERVAL}ms` }}
          />
        </div>
      </div>
    </div>
  );
}

/* ─── Login page ─────────────────────────────────────────────────── */
export default function LoginPage() {
  const dispatch  = useDispatch();
  const navigate  = useNavigate();
  const location  = useLocation();
  const { loading, error } = useSelector((s) => s.auth);

  const [form,     setForm]     = useState({ email: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [errors,   setErrors]   = useState({});

  const from = new URLSearchParams(location.search).get('from') || '/';

  useEffect(() => { dispatch(clearError()); }, [dispatch]);

  const validate = () => {
    const e = {};
    if (!form.email.trim())  e.email = 'Email is required';
    else if (!/^\S+@\S+\.\S+$/.test(form.email)) e.email = 'Enter a valid email address';
    if (!form.password)      e.password = 'Password is required';
    return e;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
    if (errors[name]) setErrors((p) => ({ ...p, [name]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    const result = await dispatch(login({ email: form.email, password: form.password }));
    if (login.fulfilled.match(result)) navigate(from, { replace: true });
  };

  return (
    <div className="auth-split-page">
      {/* ── Left: form ──────────────────────────────────────────── */}
      <div className="auth-split-form">
        <div className="auth-split-inner">
          {/* Mobile logo */}
          <div className="auth-logo auth-logo-mobile">
            <Link to="/">ACHRAF<span>SHOP</span></Link>
          </div>

          <h1 className="auth-title">Welcome back</h1>
          <p className="auth-sub">Sign in to your account to continue shopping.</p>

          {error && (
            <div className="alert alert-error auth-alert"><span>{error}</span></div>
          )}

          <form onSubmit={handleSubmit} noValidate className="auth-form">
            {/* Email */}
            <div className="form-group">
              <label className="form-label" htmlFor="login-email">Email address</label>
              <div className="input-icon-wrap">
                <FiMail className="input-icon" />
                <input
                  id="login-email"
                  type="email" name="email"
                  placeholder="you@gmail.com"
                  value={form.email}
                  onChange={handleChange}
                  className={`form-input input-with-icon ${errors.email ? 'input-error' : ''}`}
                  autoComplete="email"
                />
              </div>
              {errors.email && <span className="form-error">{errors.email}</span>}
            </div>

            {/* Password */}
            <div className="form-group">
              <div className="label-row">
                <label className="form-label" htmlFor="login-password">Password</label>
                <Link to="/forgot-password" className="forgot-link">Forgot password?</Link>
              </div>
              <div className="input-icon-wrap">
                <FiLock className="input-icon" />
                <input
                  id="login-password"
                  type={showPass ? 'text' : 'password'}
                  name="password"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={handleChange}
                  className={`form-input input-with-icon input-with-icon-right ${errors.password ? 'input-error' : ''}`}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="input-icon-right"
                  onClick={() => setShowPass(!showPass)}
                  tabIndex={-1}
                >
                  {showPass ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>
              {errors.password && <span className="form-error">{errors.password}</span>}
            </div>

            <button
              type="submit"
              className="btn btn-accent btn-lg auth-submit"
              disabled={loading}
            >
              {loading ? <span className="spinner spinner-sm" /> : <>Sign In <FiArrowRight /></>}
            </button>
          </form>

          <p className="auth-switch">
            Don't have an account?{' '}
            <Link to="/register" className="auth-switch-link">Create one free →</Link>
          </p>
        </div>
      </div>

      {/* ── Right: slideshow ────────────────────────────────────── */}
      <AuthSlideshow />
    </div>
  );
}
