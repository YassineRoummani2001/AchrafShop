import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { register, clearError } from '../../store/slices/authSlice';
import { FiUser, FiMail, FiLock, FiEye, FiEyeOff, FiArrowRight, FiCheck, FiX } from 'react-icons/fi';
import '../LoginPage/AuthPages.css';

/* Password strength rules */
const RULES = [
  { id: 'len',   label: 'At least 6 characters',   test: (p) => p.length >= 6 },
  { id: 'upper', label: 'One uppercase letter',      test: (p) => /[A-Z]/.test(p) },
  { id: 'num',   label: 'One number',               test: (p) => /\d/.test(p) },
];

export default function RegisterPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((s) => s.auth);

  const [form, setForm] = useState({ name:'', email:'', password:'', confirmPassword:'' });
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  useEffect(() => { dispatch(clearError()); }, [dispatch]);

  const validate = (f = form) => {
    const e = {};
    if (!f.name.trim())           e.name = 'Full name is required';
    else if (f.name.trim().length < 2) e.name = 'Name must be at least 2 characters';
    if (!f.email.trim())          e.email = 'Email is required';
    else if (!/^\S+@\S+\.\S+$/.test(f.email)) e.email = 'Enter a valid email address';
    if (!f.password)              e.password = 'Password is required';
    else if (f.password.length < 6) e.password = 'Password must be at least 6 characters';
    if (!f.confirmPassword)       e.confirmPassword = 'Please confirm your password';
    else if (f.password !== f.confirmPassword) e.confirmPassword = 'Passwords do not match';
    return e;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    const updated = { ...form, [name]: value };
    setForm(updated);
    if (touched[name]) setErrors(validate(updated));
  };

  const handleBlur = (e) => {
    setTouched((p) => ({ ...p, [e.target.name]: true }));
    setErrors(validate());
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setTouched({ name:true, email:true, password:true, confirmPassword:true });
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    const result = await dispatch(register({ name: form.name, email: form.email, password: form.password }));
    if (register.fulfilled.match(result)) navigate('/');
  };

  const strength = RULES.map((r) => ({ ...r, ok: r.test(form.password) }));

  return (
    <div className="auth-page">
      <div className="auth-card auth-card-wide">
        <div className="auth-logo">
          <Link to="/">ACHRAF<span>SHOP</span></Link>
        </div>

        <h1 className="auth-title">Create your account</h1>
        <p className="auth-sub">Join thousands of shoppers. Free and always will be.</p>

        {error && <div className="alert alert-error auth-alert"><span>{error}</span></div>}

        <form onSubmit={handleSubmit} noValidate className="auth-form">
          {/* Full Name */}
          <div className="form-group">
            <label className="form-label" htmlFor="reg-name">Full Name</label>
            <div className="input-icon-wrap">
              <FiUser className="input-icon"/>
              <input
                id="reg-name"
                type="text"
                name="name"
                placeholder="Achraf Benali"
                value={form.name}
                onChange={handleChange}
                onBlur={handleBlur}
                className={`form-input input-with-icon ${errors.name && touched.name ? 'input-error' : ''}`}
                autoComplete="name"
              />
            </div>
            {errors.name && touched.name && <span className="form-error">{errors.name}</span>}
          </div>

          {/* Email */}
          <div className="form-group">
            <label className="form-label" htmlFor="reg-email">Email address</label>
            <div className="input-icon-wrap">
              <FiMail className="input-icon"/>
              <input
                id="reg-email"
                type="email"
                name="email"
                placeholder="you@gmail.com"
                value={form.email}
                onChange={handleChange}
                onBlur={handleBlur}
                className={`form-input input-with-icon ${errors.email && touched.email ? 'input-error' : ''}`}
                autoComplete="email"
              />
            </div>
            {errors.email && touched.email && <span className="form-error">{errors.email}</span>}
          </div>

          {/* Password */}
          <div className="form-group">
            <label className="form-label" htmlFor="reg-password">Password</label>
            <div className="input-icon-wrap">
              <FiLock className="input-icon"/>
              <input
                id="reg-password"
                type={showPass ? 'text' : 'password'}
                name="password"
                placeholder="Create a strong password"
                value={form.password}
                onChange={handleChange}
                onBlur={handleBlur}
                className={`form-input input-with-icon input-with-icon-right ${errors.password && touched.password ? 'input-error' : ''}`}
                autoComplete="new-password"
              />
              <button type="button" className="input-icon-right" onClick={() => setShowPass(!showPass)} tabIndex={-1}>
                {showPass ? <FiEyeOff/> : <FiEye/>}
              </button>
            </div>
            {errors.password && touched.password && <span className="form-error">{errors.password}</span>}

            {/* Password strength indicators */}
            {form.password && (
              <ul className="password-rules">
                {strength.map((r) => (
                  <li key={r.id} className={`rule-item ${r.ok ? 'ok' : 'fail'}`}>
                    {r.ok ? <FiCheck size={12}/> : <FiX size={12}/>}
                    {r.label}
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Confirm Password */}
          <div className="form-group">
            <label className="form-label" htmlFor="reg-confirm">Confirm Password</label>
            <div className="input-icon-wrap">
              <FiLock className="input-icon"/>
              <input
                id="reg-confirm"
                type={showConfirm ? 'text' : 'password'}
                name="confirmPassword"
                placeholder="Repeat your password"
                value={form.confirmPassword}
                onChange={handleChange}
                onBlur={handleBlur}
                className={`form-input input-with-icon input-with-icon-right ${errors.confirmPassword && touched.confirmPassword ? 'input-error' : ''}`}
                autoComplete="new-password"
              />
              <button type="button" className="input-icon-right" onClick={() => setShowConfirm(!showConfirm)} tabIndex={-1}>
                {showConfirm ? <FiEyeOff/> : <FiEye/>}
              </button>
            </div>
            {errors.confirmPassword && touched.confirmPassword && (
              <span className="form-error">{errors.confirmPassword}</span>
            )}
          </div>

          <button type="submit" className="btn btn-accent btn-lg auth-submit" disabled={loading}>
            {loading ? <span className="spinner spinner-sm"/> : <>Create Account <FiArrowRight/></>}
          </button>

          <p className="terms-note">
            By creating an account, you agree to our{' '}
            <Link to="/terms">Terms of Service</Link> and{' '}
            <Link to="/privacy">Privacy Policy</Link>.
          </p>
        </form>

        <p className="auth-switch">
          Already have an account?{' '}
          <Link to="/login" className="auth-switch-link">Sign in →</Link>
        </p>
      </div>
    </div>
  );
}
