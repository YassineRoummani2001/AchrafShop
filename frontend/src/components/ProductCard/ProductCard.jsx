import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { FiShoppingCart, FiHeart, FiEye, FiStar } from 'react-icons/fi';
import { addToCart } from '../../store/slices/cartSlice';
import { toast } from 'react-toastify';
import './ProductCard.css';

const StarRating = ({ rating }) => {
  return (
    <div className="star-row">
      {[1, 2, 3, 4, 5].map((star) => (
        <FiStar
          key={star}
          size={13}
          className={star <= Math.round(rating) ? 'star-filled' : 'star-empty'}
          fill={star <= Math.round(rating) ? 'currentColor' : 'none'}
        />
      ))}
    </div>
  );
};

const ProductCard = ({ product }) => {
  const dispatch = useDispatch();
  const { userInfo, profile } = useSelector((state) => state.auth);
  const [imgError, setImgError] = useState(false);
  
  const isInitiallyWishlisted = profile?.wishlist?.some(p => (p._id || p) === product._id);
  const [isWishlisted, setIsWishlisted] = React.useState(isInitiallyWishlisted || false);

  React.useEffect(() => {
    if (profile?.wishlist) {
      setIsWishlisted(profile.wishlist.some(p => (p._id || p) === product._id));
    }
  }, [profile, product._id]);

  const price = product.discountPrice > 0 ? product.discountPrice : product.price;
  const hasDiscount = product.discountPrice > 0;
  const discountPct = hasDiscount
    ? Math.round(((product.price - product.discountPrice) / product.price) * 100)
    : 0;

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (product.stock === 0) {
      toast.error('This product is out of stock');
      return;
    }
    dispatch(addToCart({ product, quantity: 1 }));
  };

  const handleWishlist = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!userInfo) {
      toast.info('Please sign in to save items to your wishlist');
      return;
    }
    
    // Optimistic update
    setIsWishlisted(!isWishlisted);
    try {
      const api = (await import('../../utils/api')).default;
      await api.put(`/auth/wishlist/${product._id}`);
      toast.success(!isWishlisted ? 'Added to wishlist!' : 'Removed from wishlist');
      
      // Refresh profile if we are on the profile page
      if (window.location.pathname === '/profile') {
        const { getProfile } = await import('../../store/slices/authSlice');
        dispatch(getProfile());
      }
    } catch (err) {
      setIsWishlisted(isWishlisted); // Revert
      toast.error('Failed to update wishlist');
    }
  };

  return (
    <Link to={`/products/${product._id}`} className="product-card">
      {/* Image */}
      <div className="product-card-img-wrap">
        <img
          src={imgError ? 'https://placehold.co/400x500?text=No+Image' : (product.images?.[0]?.url || 'https://placehold.co/400x500?text=No+Image')}
          alt={product.name}
          className="product-card-img"
          onError={() => setImgError(true)}
          loading="lazy"
        />

        {/* Badges */}
        <div className="product-badges">
          {product.stock === 0 && <span className="product-badge badge-sold-out">Sold Out</span>}
          {hasDiscount && product.stock > 0 && (
            <span className="product-badge badge-sale">-{discountPct}%</span>
          )}
          {product.isFeatured && <span className="product-badge badge-featured">Featured</span>}
        </div>

        {/* Hover actions */}
        <div className="product-card-actions">
          <button
            className={`action-btn ${isWishlisted ? 'wishlisted' : ''}`}
            onClick={handleWishlist}
            aria-label="Add to wishlist"
          >
            <FiHeart size={18} fill={isWishlisted ? 'currentColor' : 'none'} />
          </button>
          <button
            className="action-btn quick-view"
            onClick={handleAddToCart}
            aria-label="Add to cart"
          >
            <FiShoppingCart size={18} />
          </button>
          <Link
            to={`/products/${product._id}`}
            className="action-btn"
            onClick={(e) => e.stopPropagation()}
            aria-label="View product"
          >
            <FiEye size={18} />
          </Link>
        </div>
      </div>

      {/* Content */}
      <div className="product-card-body">
        {product.category && (
          <span className="product-category">{product.category.name || product.gender}</span>
        )}
        <h3 className="product-name">{product.name}</h3>

        {product.numReviews > 0 && (
          <div className="product-rating">
            <StarRating rating={product.rating} />
            <span className="rating-count">({product.numReviews})</span>
          </div>
        )}

        <div className="product-price-row">
          <span className="product-price">${price.toFixed(2)}</span>
          {hasDiscount && (
            <span className="product-price-original">${product.price.toFixed(2)}</span>
          )}
        </div>

        <button
          className="product-add-btn"
          onClick={handleAddToCart}
          disabled={product.stock === 0}
        >
          {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
        </button>
      </div>
    </Link>
  );
};

export default ProductCard;
