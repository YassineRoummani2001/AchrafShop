import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { selectCartItems, selectCartTotal, clearCart } from '../../store/slices/cartSlice';
import { createOrder, clearOrderState } from '../../store/slices/orderSlice';
import { toast } from 'react-toastify';
import {
  FiUser, FiMail, FiPhone, FiMapPin, FiFileText,
  FiShoppingBag, FiLock, FiCheck, FiArrowRight,
} from 'react-icons/fi';
import './CheckoutPage.css';

const TAX_RATE = 0.08;
const SHIPPING_THRESHOLD = 50;
const SHIPPING_COST = 8.99;

const STEPS = ['Shipping', 'Review', 'Confirm'];

export default function CheckoutPage() {
  const dispatch  = useDispatch();
  const navigate  = useNavigate();
  const { userInfo, profile } = useSelector((s) => s.auth);
  const { loading, error, success, currentOrder } = useSelector((s) => s.orders);
  const cartItems = useSelector(selectCartItems);
  const subtotal  = useSelector(selectCartTotal);

  const shipping = subtotal >= SHIPPING_THRESHOLD ? 0 : SHIPPING_COST;
  const tax      = +(subtotal * TAX_RATE).toFixed(2);
  const total    = +(subtotal + shipping + tax).toFixed(2);

  const [step, setStep] = useState(0); // 0 = shipping, 1 = review, 2 = success

  /* Auto-fill from profile */
  const [form, setForm] = useState({
    fullName: '',
    email:    '',
    phone:    '',
    city:     '',
    address:  '',
    notes:    '',
  });
  const [errors, setErrors] = useState({});
  const [paymentMethod, setPaymentMethod] = useState('cod');

  /* Fill form from logged-in profile */
  useEffect(() => {
    if (userInfo) {
      setForm((p) => ({
        ...p,
        fullName: profile?.name  || userInfo.name  || '',
        email:    profile?.email || userInfo.email  || '',
        phone:    profile?.phone || '',
        city:     profile?.city  || '',
        address:  profile?.address || '',
      }));
    }
  }, [userInfo, profile]);

  /* Clear order state on unmount */
  useEffect(() => {
    dispatch(clearOrderState());
    return () => dispatch(clearOrderState());
  }, [dispatch]);

  /* Redirect on success */
  useEffect(() => {
    if (success && currentOrder) {
      dispatch(clearCart());
      navigate(`/order-confirmation/${currentOrder._id}`);
    }
  }, [success, currentOrder, dispatch, navigate]);

  /* Redirect if cart empty */
  useEffect(() => {
    if (cartItems.length === 0 && !success) navigate('/cart');
  }, [cartItems.length, success, navigate]);

  const validate = () => {
    const e = {};
    if (!form.fullName.trim())   e.fullName = 'Full name is required';
    if (!form.email.trim())      e.email = 'Email is required';
    else if (!/^\S+@\S+\.\S+$/.test(form.email)) e.email = 'Enter a valid email';
    if (!form.phone.trim())      e.phone = 'Phone number is required';
    if (!form.city.trim())       e.city = 'City is required';
    if (!form.address.trim())    e.address = 'Full address is required';
    return e;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
    if (errors[name]) setErrors((p) => ({ ...p, [name]: '' }));
  };

  const handleNext = (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setStep(1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePlaceOrder = async () => {
    const orderPayload = {
      orderItems: cartItems.map((item) => ({
        product:  item._id,
        name:     item.name,
        image:    item.image,
        price:    item.price,
        quantity: item.quantity,
        size:     item.size,
        color:    item.color,
      })),
      shippingInfo: {
        fullName: form.fullName,
        email:    form.email,
        phone:    form.phone,
        city:     form.city,
        address:  form.address,
        notes:    form.notes,
      },
      paymentMethod,
      itemsPrice:   +subtotal.toFixed(2),
      shippingPrice: shipping,
      taxPrice:      tax,
      totalPrice:    total,
    };

    const result = await dispatch(createOrder(orderPayload));
    if (createOrder.rejected.match(result)) {
      toast.error(result.payload || 'Failed to place order. Please try again.');
    }
  };

  return (
    <div className="checkout-page">
      <div className="container checkout-container">

        {/* ── STEP INDICATOR ── */}
        <div className="checkout-steps">
          {STEPS.map((label, i) => (
            <React.Fragment key={label}>
              <div className={`step-item ${i <= step ? 'active' : ''} ${i < step ? 'done' : ''}`}>
                <div className="step-circle">
                  {i < step ? <FiCheck size={14}/> : i + 1}
                </div>
                <span className="step-label">{label}</span>
              </div>
              {i < STEPS.length - 1 && <div className={`step-line ${i < step ? 'done' : ''}`}/>}
            </React.Fragment>
          ))}
        </div>

        <div className="checkout-layout">
          {/* ── LEFT PANEL ── */}
          <div className="checkout-main">

            {/* ── STEP 0: SHIPPING FORM ── */}
            {step === 0 && (
              <form onSubmit={handleNext} noValidate className="checkout-form">
                <div className="checkout-card">
                  <h2 className="checkout-section-title">
                    <FiMapPin className="section-icon"/> Shipping Information
                  </h2>

                  {/* Auto-fill notice */}
                  {userInfo && (
                    <div className="autofill-notice">
                      <FiUser size={14}/> Auto-filled from your profile.
                      <a href="/profile">Update profile</a>
                    </div>
                  )}

                  <div className="form-grid-2">
                    {/* Full Name */}
                    <div className="form-group">
                      <label className="form-label" htmlFor="co-name">
                        <FiUser className="label-icon"/> Full Name *
                      </label>
                      <input
                        id="co-name" type="text" name="fullName"
                        value={form.fullName} onChange={handleChange}
                        className={`form-input ${errors.fullName ? 'input-error' : ''} ${userInfo ? 'read-only' : ''}`}
                        placeholder="Achraf Benali"
                        readOnly={!!userInfo}
                      />
                      {errors.fullName && <span className="form-error">{errors.fullName}</span>}
                    </div>

                    {/* Email */}
                    <div className="form-group">
                      <label className="form-label" htmlFor="co-email">
                        <FiMail className="label-icon"/> Email Address *
                      </label>
                      <input
                        id="co-email" type="email" name="email"
                        value={form.email} onChange={handleChange}
                        className={`form-input ${errors.email ? 'input-error' : ''} ${userInfo ? 'read-only' : ''}`}
                        placeholder="you@gmail.com"
                        readOnly={!!userInfo}
                      />
                      {errors.email && <span className="form-error">{errors.email}</span>}
                    </div>

                    {/* Phone */}
                    <div className="form-group">
                      <label className="form-label" htmlFor="co-phone">
                        <FiPhone className="label-icon"/> Phone Number *
                      </label>
                      <input
                        id="co-phone" type="tel" name="phone"
                        value={form.phone} onChange={handleChange}
                        className={`form-input ${errors.phone ? 'input-error' : ''} ${userInfo ? 'read-only' : ''}`}
                        placeholder="+212 6XX XXX XXX"
                        readOnly={!!userInfo}
                      />
                      {errors.phone && <span className="form-error">{errors.phone}</span>}
                    </div>

                    {/* City */}
                    <div className="form-group">
                      <label className="form-label" htmlFor="co-city">
                        <FiMapPin className="label-icon"/> City *
                      </label>
                      <input
                        id="co-city" type="text" name="city"
                        value={form.city} onChange={handleChange}
                        className={`form-input ${errors.city ? 'input-error' : ''} ${userInfo ? 'read-only' : ''}`}
                        placeholder="e.g. Casablanca"
                        readOnly={!!userInfo}
                      />
                      {errors.city && <span className="form-error">{errors.city}</span>}
                    </div>

                    {/* Address — full width */}
                    <div className="form-group full-width">
                      <label className="form-label" htmlFor="co-address">
                        <FiMapPin className="label-icon"/> Full Address *
                      </label>
                      <textarea
                        id="co-address" name="address"
                        value={form.address} onChange={handleChange}
                        className={`form-input co-textarea ${errors.address ? 'input-error' : ''} ${userInfo ? 'read-only' : ''}`}
                        placeholder="Street name, building number, neighbourhood, postal code..."
                        rows={3}
                        readOnly={!!userInfo}
                      />
                      {errors.address && <span className="form-error">{errors.address}</span>}
                    </div>

                    {/* Notes — optional */}
                    <div className="form-group full-width">
                      <label className="form-label" htmlFor="co-notes">
                        <FiFileText className="label-icon"/> Notes <span className="optional">(optional)</span>
                      </label>
                      <textarea
                        id="co-notes" name="notes"
                        value={form.notes} onChange={handleChange}
                        className="form-input co-textarea"
                        placeholder="Delivery instructions, preferred time, etc."
                        rows={2}
                      />
                    </div>
                  </div>
                </div>

                {/* Payment method */}
                <div className="checkout-card">
                  <h2 className="checkout-section-title">
                    <FiLock className="section-icon"/> Payment Method
                  </h2>
                  <div className="payment-options">
                    {[
                      { id:'cod',    label:'Cash on Delivery',  desc:'Pay when your order arrives', emoji:'💵' },
                      { id:'stripe', label:'Credit / Debit Card',desc:'Powered by Stripe',          emoji:'💳' },
                    ].map((opt) => (
                      <label key={opt.id} className={`payment-option ${paymentMethod === opt.id ? 'selected' : ''}`}>
                        <input
                          type="radio"
                          name="paymentMethod"
                          value={opt.id}
                          checked={paymentMethod === opt.id}
                          onChange={() => setPaymentMethod(opt.id)}
                          className="payment-radio"
                        />
                        <span className="payment-emoji">{opt.emoji}</span>
                        <div>
                          <p className="payment-label">{opt.label}</p>
                          <p className="payment-desc">{opt.desc}</p>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                <button type="submit" className="btn btn-accent btn-lg checkout-next-btn">
                  Review Order <FiArrowRight/>
                </button>
              </form>
            )}

            {/* ── STEP 1: REVIEW ── */}
            {step === 1 && (
              <div className="checkout-review">
                {/* Shipping summary */}
                <div className="checkout-card">
                  <div className="review-section-header">
                    <h2 className="checkout-section-title"><FiMapPin className="section-icon"/> Shipping To</h2>
                    <button className="btn btn-ghost btn-sm" onClick={() => setStep(0)}>Edit</button>
                  </div>
                  <div className="review-info-grid">
                    <div className="review-info-item">
                      <span className="review-info-label">Name</span>
                      <span className="review-info-value">{form.fullName}</span>
                    </div>
                    <div className="review-info-item">
                      <span className="review-info-label">Email</span>
                      <span className="review-info-value">{form.email}</span>
                    </div>
                    <div className="review-info-item">
                      <span className="review-info-label">Phone</span>
                      <span className="review-info-value">{form.phone}</span>
                    </div>
                    <div className="review-info-item">
                      <span className="review-info-label">City</span>
                      <span className="review-info-value">{form.city}</span>
                    </div>
                    <div className="review-info-item full-width">
                      <span className="review-info-label">Address</span>
                      <span className="review-info-value">{form.address}</span>
                    </div>
                    {form.notes && (
                      <div className="review-info-item full-width">
                        <span className="review-info-label">Notes</span>
                        <span className="review-info-value">{form.notes}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Items list */}
                <div className="checkout-card">
                  <h2 className="checkout-section-title"><FiShoppingBag className="section-icon"/> Items ({cartItems.length})</h2>
                  <div className="review-items">
                    {cartItems.map((item) => (
                      <div key={`${item._id}-${item.size}-${item.color}`} className="review-item">
                        <img
                          src={item.image || 'https://placehold.co/56x68?text=?'}
                          alt={item.name}
                          className="review-item-img"
                          onError={(e) => { e.target.src='https://placehold.co/56x68?text=?'; }}
                        />
                        <div className="review-item-info">
                          <p className="review-item-name">{item.name}</p>
                          <p className="review-item-meta">
                            {item.size && `Size: ${item.size}`}
                            {item.color && ` · ${item.color}`}
                            {` · Qty: ${item.quantity}`}
                          </p>
                        </div>
                        <p className="review-item-price">${(item.price * item.quantity).toFixed(2)}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Error */}
                {error && <div className="alert alert-error">{error}</div>}

                <div className="review-actions">
                  <button className="btn btn-outline" onClick={() => setStep(0)}>← Back</button>
                  <button
                    className="btn btn-accent btn-lg"
                    onClick={handlePlaceOrder}
                    disabled={loading}
                  >
                    {loading ? <><span className="spinner spinner-sm"/> Placing Order…</> : <>Place Order <FiCheck/></>}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* ── RIGHT: ORDER SUMMARY ── */}
          <aside className="checkout-summary">
            <h3 className="summary-title">Order Summary</h3>
            <div className="checkout-summary-items">
              {cartItems.map((item) => (
                <div key={`${item._id}-${item.size}`} className="summary-item">
                  <div className="summary-item-img-wrap">
                    <img
                      src={item.image || 'https://placehold.co/44x52?text=?'}
                      alt={item.name}
                      className="summary-item-img"
                      onError={(e) => { e.target.src='https://placehold.co/44x52?text=?'; }}
                    />
                    <span className="summary-item-qty">{item.quantity}</span>
                  </div>
                  <p className="summary-item-name">{item.name}</p>
                  <p className="summary-item-price">${(item.price * item.quantity).toFixed(2)}</p>
                </div>
              ))}
            </div>

            <div className="summary-divider"/>
            <div className="summary-row"><span>Subtotal</span><span>${subtotal.toFixed(2)}</span></div>
            <div className="summary-row">
              <span>Shipping</span>
              <span>{shipping === 0 ? <span className="free-tag">FREE</span> : `$${shipping.toFixed(2)}`}</span>
            </div>
            <div className="summary-row"><span>Tax (8%)</span><span>${tax}</span></div>
            <div className="summary-divider"/>
            <div className="summary-row summary-total">
              <span>Total</span>
              <span>${total.toFixed(2)}</span>
            </div>

            <div className="checkout-secure-badge">
              <FiLock size={13}/> Secure SSL encrypted checkout
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
