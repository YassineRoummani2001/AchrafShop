import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

// Public layout components
import Navbar  from './components/Navbar/Navbar';
import Footer  from './components/Footer/Footer';

// Admin layout
import AdminLayout from './components/AdminLayout/AdminLayout';

// User pages
import HomePage             from './pages/HomePage/HomePage';
import api                  from './utils/api';
import ShopPage             from './pages/ShopPage/ShopPage';
import ProductDetailPage    from './pages/ProductDetailPage/ProductDetailPage';
import CartPage             from './pages/CartPage/CartPage';
import CheckoutPage         from './pages/CheckoutPage/CheckoutPage';
import LoginPage            from './pages/LoginPage/LoginPage';
import RegisterPage         from './pages/RegisterPage/RegisterPage';
import ProfilePage          from './pages/ProfilePage/ProfilePage';
import OrderConfirmationPage from './pages/OrderConfirmationPage/OrderConfirmationPage';
import NotFoundPage         from './pages/NotFoundPage/NotFoundPage';
import { FAQPage, ShippingReturnsPage, SizeGuidePage, TrackOrderPage, ContactPage } from './pages/HelpPages/HelpPages';

// Admin pages
import AdminDashboard from './pages/Admin/AdminDashboard';
import AdminProducts  from './pages/Admin/AdminProducts';
import AdminOrders    from './pages/Admin/AdminOrders';
import AdminUsers     from './pages/Admin/AdminUsers';
import AdminBrands    from './pages/Admin/AdminBrands';
import AdminHero      from './pages/Admin/AdminHero';
import AdminThemes    from './pages/Admin/AdminThemes';
import AdminStock     from './pages/Admin/AdminStock';

import './App.css';

// ── Route Guards ─────────────────────────────────────────────────────────────

/** Redirect to login if not authenticated */
const PrivateRoute = ({ children }) => {
  const { userInfo } = useSelector((s) => s.auth);
  return userInfo ? children : <Navigate to="/login" replace />;
};

/** Redirect to home if already logged in */
const AuthRoute = ({ children }) => {
  const { userInfo } = useSelector((s) => s.auth);
  if (!userInfo) return children;
  return <Navigate to={userInfo.role === 'admin' ? '/admin' : '/'} replace />;
};

/** Allow only admins — redirect others appropriately */
const AdminRoute = ({ children }) => {
  const { userInfo } = useSelector((s) => s.auth);
  if (!userInfo) return <Navigate to="/login" replace />;
  if (userInfo.role !== 'admin') return <Navigate to="/" replace />;
  return children;
};

function App() {
  React.useEffect(() => {
    // Fetch active theme and apply it
    api.get('/themes/active')
      .then(({ data }) => {
        const theme = data.data;
        if (theme) {
          const root = document.documentElement;
          if (theme.primaryColor) {
            root.style.setProperty('--primary', theme.primaryColor);
            root.style.setProperty('--primary-dark', theme.primaryColor); // Can generate dark variants if needed
          }
          if (theme.secondaryColor) {
            root.style.setProperty('--accent', theme.secondaryColor);
            root.style.setProperty('--accent-hover', theme.secondaryColor);
          }
          if (theme.backgroundColor) {
            root.style.setProperty('--bg', theme.backgroundColor);
            root.style.setProperty('--surface', theme.backgroundColor);
          }
          if (theme.fontStyle) {
            root.style.setProperty('--font-main', theme.fontStyle);
          }
          // Optionally save the theme globally if components need to know the active theme name
          window.__ACTIVE_THEME__ = theme;
          
          // Dispatch a custom event so other components can react
          window.dispatchEvent(new CustomEvent('themeLoaded', { detail: theme }));
        }
      })
      .catch(console.error);
  }, []);

  return (
    <Router>
      <Routes>

        {/* ── Admin panel (no Navbar/Footer) ─── */}
        <Route
          path="/admin"
          element={<AdminRoute><AdminLayout /></AdminRoute>}
        >
          <Route index element={<AdminDashboard />} />
          <Route path="products" element={<AdminProducts />} />
          <Route path="orders"   element={<AdminOrders />} />
          <Route path="users"    element={<AdminUsers />} />
          <Route path="brands"   element={<AdminBrands />} />
          <Route path="hero"     element={<AdminHero />} />
          <Route path="themes"   element={<AdminThemes />} />
        </Route>

        {/* ── Public storefront (with Navbar/Footer) ─── */}
        <Route
          path="/*"
          element={
            <div className="app-layout">
              <Navbar />
              <main className="app-main">
                <Routes>
                  {/* Public */}
                  <Route path="/"         element={<HomePage />} />
                  <Route path="/shop"     element={<ShopPage />} />
                  <Route path="/products/:id" element={<ProductDetailPage />} />
                  <Route path="/cart"     element={<CartPage />} />

                  {/* Auth (redirect if already logged in) */}
                  <Route path="/login"    element={<AuthRoute><LoginPage /></AuthRoute>} />
                  <Route path="/register" element={<AuthRoute><RegisterPage /></AuthRoute>} />

                  {/* Protected */}
                  <Route path="/checkout" element={<PrivateRoute><CheckoutPage /></PrivateRoute>} />
                  <Route path="/order-confirmation/:id" element={<PrivateRoute><OrderConfirmationPage /></PrivateRoute>} />
                  <Route path="/profile"  element={<PrivateRoute><ProfilePage /></PrivateRoute>} />

                  {/* Help Pages */}
                  <Route path="/faq"              element={<FAQPage />} />
                  <Route path="/shipping-returns" element={<ShippingReturnsPage />} />
                  <Route path="/size-guide"       element={<SizeGuidePage />} />
                  <Route path="/track-order"      element={<TrackOrderPage />} />
                  <Route path="/contact"          element={<ContactPage />} />

                  {/* 404 */}
                  <Route path="*" element={<NotFoundPage />} />
                </Routes>
              </main>
              <Footer />
            </div>
          }
        />

      </Routes>
    </Router>
  );
}

export default App;
