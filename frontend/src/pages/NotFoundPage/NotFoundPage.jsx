import React from 'react';
import { Link } from 'react-router-dom';
import { FiHome, FiShoppingBag } from 'react-icons/fi';
import './NotFoundPage.css';

export default function NotFoundPage() {
  return (
    <div className="not-found-page">
      <div className="not-found-inner">
        <p className="not-found-number">404</p>
        <h1 className="not-found-title">Page Not Found</h1>
        <p className="not-found-sub">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="not-found-actions">
          <Link to="/" className="btn btn-primary">
            <FiHome/> Go Home
          </Link>
          <Link to="/shop" className="btn btn-accent">
            <FiShoppingBag/> Browse Shop
          </Link>
        </div>
      </div>
    </div>
  );
}
