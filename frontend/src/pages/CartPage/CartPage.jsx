import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import {
  selectCartItems, selectCartTotal,
  removeFromCart, updateQuantity, clearCart,
} from '../../store/slices/cartSlice';
import { FiTrash2, FiMinus, FiPlus, FiShoppingBag, FiArrowRight, FiTag } from 'react-icons/fi';
import './CartPage.css';

const SHIPPING_THRESHOLD = 50;
const SHIPPING_COST      = 8.99;
const TAX_RATE           = 0.08;

export default function CartPage() {
  const dispatch   = useDispatch();
  const navigate   = useNavigate();
  const items      = useSelector(selectCartItems);
  const subtotal   = useSelector(selectCartTotal);
  const { userInfo } = useSelector((s) => s.auth);

  const shippingCost = subtotal >= SHIPPING_THRESHOLD ? 0 : SHIPPING_COST;
  const tax          = subtotal * TAX_RATE;
  const total        = subtotal + shippingCost + tax;

  if (items.length === 0) {
    return (
      <div className="cart-page">
        <div className="container">
          <div className="empty-state cart-empty">
            <FiShoppingBag size={64}/>
            <h2>Your cart is empty</h2>
            <p>Looks like you haven't added anything yet.</p>
            <Link to="/shop" className="btn btn-accent btn-lg">
              Start Shopping <FiArrowRight/>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const handleCheckout = () => {
    if (!userInfo) {
      navigate('/login?from=/checkout');
    } else {
      navigate('/checkout');
    }
  };

  return (
    <div className="cart-page">
      <div className="container">
        <h1 className="cart-heading">Shopping Cart <span className="cart-count-label">({items.length} item{items.length !== 1 ? 's' : ''})</span></h1>

        <div className="cart-layout">
          {/* Items */}
          <div className="cart-items">
            <div className="cart-items-header">
              <button className="clear-cart-btn" onClick={() => dispatch(clearCart())}>
                <FiTrash2 size={14}/> Clear cart
              </button>
            </div>

            {items.map((item) => (
              <div key={`${item._id}-${item.size}-${item.color}`} className="cart-item">
                <Link to={`/products/${item._id}`}>
                  <img
                    src={item.image || 'https://placehold.co/90x110?text=?'}
                    alt={item.name}
                    className="cart-item-img"
                    onError={(e) => { e.target.src='https://placehold.co/90x110?text=?'; }}
                  />
                </Link>
                <div className="cart-item-body">
                  <Link to={`/products/${item._id}`} className="cart-item-name">{item.name}</Link>
                  <div className="cart-item-variants">
                    {item.size  && <span className="variant-tag">Size: {item.size}</span>}
                    {item.color && <span className="variant-tag">Color: {item.color}</span>}
                  </div>
                  <div className="cart-item-bottom">
                    {/* Quantity */}
                    <div className="qty-control">
                      <button
                        className="qty-btn"
                        onClick={() => dispatch(updateQuantity({ id:item._id, size:item.size, color:item.color, quantity: item.quantity - 1 }))}
                        disabled={item.quantity <= 1}
                      >
                        <FiMinus size={14}/>
                      </button>
                      <span className="qty-value">{item.quantity}</span>
                      <button
                        className="qty-btn"
                        onClick={() => dispatch(updateQuantity({ id:item._id, size:item.size, color:item.color, quantity: item.quantity + 1 }))}
                        disabled={item.quantity >= item.stock}
                      >
                        <FiPlus size={14}/>
                      </button>
                    </div>

                    <div className="cart-item-price-group">
                      <p className="cart-item-price">${(item.price * item.quantity).toFixed(2)}</p>
                      {item.quantity > 1 && (
                        <p className="cart-item-unit">${item.price.toFixed(2)} each</p>
                      )}
                    </div>

                    <button
                      className="cart-item-remove"
                      onClick={() => dispatch(removeFromCart({ id:item._id, size:item.size, color:item.color }))}
                      aria-label="Remove item"
                    >
                      <FiTrash2 size={16}/>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Summary */}
          <aside className="cart-summary">
            <h2 className="summary-title">Order Summary</h2>

            <div className="summary-row">
              <span>Subtotal</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            <div className="summary-row">
              <span>Shipping</span>
              <span>{shippingCost === 0 ? <span className="free-tag">FREE</span> : `$${shippingCost.toFixed(2)}`}</span>
            </div>
            {shippingCost > 0 && (
              <p className="free-shipping-hint">
                Add ${(SHIPPING_THRESHOLD - subtotal).toFixed(2)} more for free shipping
              </p>
            )}
            <div className="summary-row">
              <span>Tax (8%)</span>
              <span>${tax.toFixed(2)}</span>
            </div>
            <div className="summary-divider"/>
            <div className="summary-row summary-total">
              <span>Total</span>
              <span>${total.toFixed(2)}</span>
            </div>

            {/* Promo code placeholder */}
            <div className="promo-wrap">
              <div className="promo-input-row">
                <FiTag className="promo-icon"/>
                <input type="text" placeholder="Promo code" className="form-input promo-input"/>
                <button className="btn btn-outline btn-sm">Apply</button>
              </div>
            </div>

            <button className="btn btn-accent btn-lg checkout-btn" onClick={handleCheckout}>
              {userInfo ? 'Proceed to Checkout' : 'Sign in to Checkout'}
              <FiArrowRight/>
            </button>

            <Link to="/shop" className="continue-shopping">
              ← Continue Shopping
            </Link>
          </aside>
        </div>
      </div>
    </div>
  );
}
