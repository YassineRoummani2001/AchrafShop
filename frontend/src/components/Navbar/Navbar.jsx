import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { FiShoppingCart, FiUser, FiSearch, FiMenu, FiX, FiHeart, FiLogOut, FiPackage, FiSettings } from 'react-icons/fi';
import { selectCartCount } from '../../store/slices/cartSlice';
import { logout } from '../../store/slices/authSlice';
import './Navbar.css';

const Navbar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const cartCount = useSelector(selectCartCount);
  const { userInfo } = useSelector((state) => state.auth);

  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setUserMenuOpen(false);
  }, [location]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
      setSearchQuery('');
    }
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
  };

  const navLinks = [
    { to: '/shop?gender=men', label: 'Men' },
    { to: '/shop?gender=women', label: 'Women' },
    { to: '/shop?gender=kids', label: 'Kids' },
    { to: '/shop?type=accessories', label: 'Accessories' },
    { to: '/shop', label: 'Sale', className: 'nav-sale' },
  ];

  return (
    <>
      <header className={`navbar ${isScrolled ? 'scrolled' : ''}`}>
        <div className="container navbar-inner">
          {/* Logo */}
          <Link to="/" className="navbar-logo">
            <span className="logo-text">ACHRAF</span>
            <span className="logo-accent">SHOP</span>
          </Link>

          {/* Desktop Nav */}
          <nav className="navbar-links">
            {navLinks.map((link) => (
              <Link key={link.to} to={link.to} className={`nav-link ${link.className || ''}`}>
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Actions */}
          <div className="navbar-actions">
            {/* Search */}
            <button className="navbar-icon-btn" onClick={() => setSearchOpen(true)} aria-label="Search">
              <FiSearch size={20} />
            </button>

            {/* Wishlist */}
            {userInfo && (
              <Link to="/profile?tab=wishlist" className="navbar-icon-btn" aria-label="Wishlist">
                <FiHeart size={20} />
              </Link>
            )}

            {/* Cart */}
            <Link to="/cart" className="navbar-icon-btn cart-btn" aria-label="Cart">
              <FiShoppingCart size={20} />
              {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
            </Link>

            {/* User Menu */}
            <div className="user-menu-wrapper">
              <button
                className="navbar-icon-btn"
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                aria-label="User menu"
              >
                <FiUser size={20} />
              </button>

              {userMenuOpen && (
                <div className="user-dropdown">
                  {userInfo ? (
                    <>
                      <div className="dropdown-header">
                        <p className="dropdown-name">{userInfo.name}</p>
                        <p className="dropdown-email">{userInfo.email}</p>
                      </div>
                      <div className="dropdown-divider" />
                      <Link to="/profile" className="dropdown-item">
                        <FiUser size={16} /> My Profile
                      </Link>
                      <Link to="/profile?tab=orders" className="dropdown-item">
                        <FiPackage size={16} /> My Orders
                      </Link>
                      {userInfo.role === 'admin' && (
                        <Link to="/admin" className="dropdown-item">
                          <FiSettings size={16} /> Admin Panel
                        </Link>
                      )}
                      <div className="dropdown-divider" />
                      <button className="dropdown-item dropdown-logout" onClick={handleLogout}>
                        <FiLogOut size={16} /> Sign Out
                      </button>
                    </>
                  ) : (
                    <>
                      <Link to="/login" className="dropdown-item">Sign In</Link>
                      <Link to="/register" className="dropdown-item">Create Account</Link>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Mobile Hamburger */}
            <button
              className="navbar-icon-btn mobile-menu-btn"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Menu"
            >
              {mobileOpen ? <FiX size={22} /> : <FiMenu size={22} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <div className={`mobile-menu ${mobileOpen ? 'open' : ''}`}>
          <nav className="mobile-nav">
            {navLinks.map((link) => (
              <Link key={link.to} to={link.to} className={`mobile-nav-link ${link.className || ''}`}>
                {link.label}
              </Link>
            ))}
            <div className="mobile-divider" />
            {userInfo ? (
              <>
                <Link to="/profile" className="mobile-nav-link">My Profile</Link>
                <Link to="/profile?tab=orders" className="mobile-nav-link">My Orders</Link>
                {userInfo.role === 'admin' && (
                  <Link to="/admin" className="mobile-nav-link">Admin Panel</Link>
                )}
                <button className="mobile-nav-link mobile-logout" onClick={handleLogout}>
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="mobile-nav-link">Sign In</Link>
                <Link to="/register" className="mobile-nav-link">Create Account</Link>
              </>
            )}
          </nav>
        </div>
      </header>

      {/* Search Overlay */}
      {searchOpen && (
        <div className="search-overlay" onClick={() => setSearchOpen(false)}>
          <div className="search-modal" onClick={(e) => e.stopPropagation()}>
            <form onSubmit={handleSearch} className="search-form">
              <FiSearch size={22} className="search-icon" />
              <input
                type="text"
                placeholder="Search for clothes, shoes, accessories..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
                className="search-input"
              />
              <button type="button" onClick={() => setSearchOpen(false)} className="search-close">
                <FiX size={22} />
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Overlay to close user menu */}
      {(userMenuOpen || mobileOpen) && (
        <div
          className="nav-overlay"
          onClick={() => { setUserMenuOpen(false); setMobileOpen(false); }}
        />
      )}
    </>
  );
};

export default Navbar;
