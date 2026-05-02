import React, { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchOrderById } from '../../store/slices/orderSlice';
import { FiCheckCircle, FiPackage, FiMapPin, FiPhone, FiMail, FiArrowRight } from 'react-icons/fi';
import './OrderConfirmationPage.css';

const STATUS_STEPS = ['pending', 'processing', 'shipped', 'delivered'];

export default function OrderConfirmationPage() {
  const { id }     = useParams();
  const dispatch   = useDispatch();
  const { currentOrder: order, loading } = useSelector((s) => s.orders);

  useEffect(() => { dispatch(fetchOrderById(id)); }, [dispatch, id]);

  if (loading) {
    return <div className="loading-overlay" style={{minHeight:'60vh'}}><div className="spinner"/></div>;
  }

  if (!order) {
    return (
      <div className="container" style={{padding:'4rem 0', textAlign:'center'}}>
        <h2>Order not found</h2>
        <Link to="/profile?tab=orders" className="btn btn-accent" style={{marginTop:'1rem'}}>My Orders</Link>
      </div>
    );
  }

  const stepIdx = STATUS_STEPS.indexOf(order.orderStatus);

  return (
    <div className="confirm-page">
      <div className="container confirm-container">
        {/* Success header */}
        <div className="confirm-header">
          <div className="confirm-icon"><FiCheckCircle size={48}/></div>
          <h1>Order Confirmed!</h1>
          <p>Thank you for your purchase. We've received your order and will process it shortly.</p>
          <span className="confirm-order-id">Order #{order._id.slice(-8).toUpperCase()}</span>
        </div>

        {/* Status tracker */}
        <div className="status-tracker">
          {STATUS_STEPS.map((s, i) => (
            <React.Fragment key={s}>
              <div className={`tracker-step ${i <= stepIdx ? 'done' : ''} ${i === stepIdx ? 'current' : ''}`}>
                <div className="tracker-dot"/>
                <span className="tracker-label">{s.charAt(0).toUpperCase() + s.slice(1)}</span>
              </div>
              {i < STATUS_STEPS.length - 1 && (
                <div className={`tracker-line ${i < stepIdx ? 'done' : ''}`}/>
              )}
            </React.Fragment>
          ))}
        </div>

        <div className="confirm-layout">
          {/* Shipping Info */}
          <div className="confirm-card">
            <h3><FiMapPin className="section-icon"/> Shipping Details</h3>
            <div className="confirm-info-list">
              <div className="confirm-info-row">
                <span className="ci-label">Name</span>
                <span className="ci-value">{order.shippingInfo?.fullName}</span>
              </div>
              <div className="confirm-info-row">
                <FiMail size={13} className="ci-icon"/>
                <span className="ci-value">{order.shippingInfo?.email}</span>
              </div>
              <div className="confirm-info-row">
                <FiPhone size={13} className="ci-icon"/>
                <span className="ci-value">{order.shippingInfo?.phone}</span>
              </div>
              <div className="confirm-info-row">
                <FiMapPin size={13} className="ci-icon"/>
                <span className="ci-value">
                  {order.shippingInfo?.address}, {order.shippingInfo?.city}
                </span>
              </div>
              {order.shippingInfo?.notes && (
                <div className="confirm-info-row">
                  <span className="ci-label">Notes</span>
                  <span className="ci-value">{order.shippingInfo.notes}</span>
                </div>
              )}
            </div>
          </div>

          {/* Order Items */}
          <div className="confirm-card">
            <h3><FiPackage className="section-icon"/> Items Ordered</h3>
            <div className="confirm-items">
              {order.orderItems?.map((item, i) => (
                <div key={i} className="confirm-item">
                  <img
                    src={item.image || 'https://placehold.co/50x62?text=?'}
                    alt={item.name}
                    className="confirm-item-img"
                    onError={(e) => { e.target.src='https://placehold.co/50x62?text=?'; }}
                  />
                  <div className="confirm-item-info">
                    <p className="confirm-item-name">{item.name}</p>
                    <p className="confirm-item-meta">
                      {item.size && `Size: ${item.size}`}
                      {item.color && ` · ${item.color}`}
                      {` · Qty: ${item.quantity}`}
                    </p>
                  </div>
                  <p className="confirm-item-price">${(item.price * item.quantity).toFixed(2)}</p>
                </div>
              ))}
            </div>

            {/* Totals */}
            <div className="confirm-totals">
              <div className="ct-row"><span>Subtotal</span><span>${order.itemsPrice?.toFixed(2)}</span></div>
              <div className="ct-row"><span>Shipping</span><span>{order.shippingPrice === 0 ? 'FREE' : `$${order.shippingPrice?.toFixed(2)}`}</span></div>
              <div className="ct-row"><span>Tax</span><span>${order.taxPrice?.toFixed(2)}</span></div>
              <div className="ct-row ct-total"><span>Total</span><span>${order.totalPrice?.toFixed(2)}</span></div>
              <div className="ct-row">
                <span>Payment</span>
                <span className="payment-method-badge">
                  {order.paymentMethod === 'cod' ? '💵 Cash on Delivery' : '💳 Card'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* CTA buttons */}
        <div className="confirm-actions">
          <Link to="/profile?tab=orders" className="btn btn-outline">
            <FiPackage/> View All Orders
          </Link>
          <Link to="/shop" className="btn btn-accent">
            Continue Shopping <FiArrowRight/>
          </Link>
        </div>
      </div>
    </div>
  );
}
