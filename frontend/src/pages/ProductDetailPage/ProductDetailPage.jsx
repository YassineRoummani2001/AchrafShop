import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProductById } from '../../store/slices/productSlice';
import { addToCart } from '../../store/slices/cartSlice';
import { FiStar, FiShoppingCart, FiHeart, FiArrowLeft, FiTruck, FiRefreshCw, FiShield } from 'react-icons/fi';
import { toast } from 'react-toastify';
import './ProductDetailPage.css';

export default function ProductDetailPage() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { currentProduct: product, loading, error } = useSelector((s) => s.products);
  const { userInfo } = useSelector((s) => s.auth);

  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSize,  setSelectedSize]  = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [quantity, setQuantity]           = useState(1);
  const [imgError, setImgError]           = useState(false);

  useEffect(() => { dispatch(fetchProductById(id)); setSelectedImage(0); }, [dispatch, id]);

  const price = product?.discountPrice > 0 ? product.discountPrice : product?.price;
  const hasDiscount = product?.discountPrice > 0;

  const handleAddToCart = () => {
    if (product.sizes?.length > 0 && !selectedSize) {
      toast.error('Please select a size'); return;
    }
    if (product.colors?.length > 0 && !selectedColor) {
      toast.error('Please select a color'); return;
    }
    dispatch(addToCart({ product, quantity, size: selectedSize, color: selectedColor }));
  };

  const handleBuyNow = () => {
    handleAddToCart();
    if (!userInfo) { navigate('/login?from=/checkout'); } else { navigate('/checkout'); }
  };

  if (loading) return <div className="loading-overlay" style={{minHeight:'60vh'}}><div className="spinner"/></div>;
  if (error || !product) return (
    <div className="container" style={{padding:'4rem 0', textAlign:'center'}}>
      <h2>{error || 'Product not found'}</h2>
      <Link to="/shop" className="btn btn-accent" style={{marginTop:'1rem'}}>← Back to Shop</Link>
    </div>
  );

  return (
    <div className="product-detail-page">
      <div className="container">
        {/* Breadcrumb */}
        <div className="breadcrumb">
          <Link to="/">Home</Link> / <Link to="/shop">Shop</Link> / <span>{product.name}</span>
        </div>

        <div className="product-detail-layout">
          {/* Images */}
          <div className="product-images">
            <div className="product-main-image">
              <img
                src={imgError ? 'https://placehold.co/600x700?text=No+Image' : (product.images?.[selectedImage]?.url || 'https://placehold.co/600x700?text=No+Image')}
                alt={product.name}
                onError={() => setImgError(true)}
              />
              {hasDiscount && (
                <span className="detail-discount-badge">
                  -{Math.round(((product.price - product.discountPrice) / product.price) * 100)}%
                </span>
              )}
            </div>
            {product.images?.length > 1 && (
              <div className="product-thumbnails">
                {product.images.map((img, i) => (
                  <button
                    key={i}
                    className={`thumb-btn ${selectedImage === i ? 'active' : ''}`}
                    onClick={() => { setSelectedImage(i); setImgError(false); }}
                  >
                    <img src={img.url} alt={`View ${i+1}`} onError={(e) => { e.target.src='https://placehold.co/80x96?text=?'; }}/>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="product-info">
            {product.category && <p className="product-detail-cat">{product.category.name}</p>}
            <h1 className="product-detail-name">{product.name}</h1>

            {product.numReviews > 0 && (
              <div className="product-detail-rating">
                {[1,2,3,4,5].map((s) => (
                  <FiStar key={s} size={16}
                    fill={s <= Math.round(product.rating) ? 'currentColor' : 'none'}
                    className={s <= Math.round(product.rating) ? 'star-filled' : 'star-empty'}
                  />
                ))}
                <span className="rating-text">{product.rating?.toFixed(1)} ({product.numReviews} reviews)</span>
              </div>
            )}

            <div className="product-detail-price">
              <span className="price-main">${price?.toFixed(2)}</span>
              {hasDiscount && <span className="price-original">${product.price?.toFixed(2)}</span>}
            </div>

            <p className="product-detail-desc">{product.description}</p>

            {/* Sizes */}
            {product.sizes?.length > 0 && (
              <div className="selector-group">
                <label className="selector-label">Size {selectedSize && <span className="selected-val">– {selectedSize}</span>}</label>
                <div className="size-options">
                  {product.sizes.map((s) => (
                    <button key={s} className={`size-btn ${selectedSize === s ? 'active' : ''}`} onClick={() => setSelectedSize(s)}>{s}</button>
                  ))}
                </div>
              </div>
            )}

            {/* Colors */}
            {product.colors?.length > 0 && (
              <div className="selector-group">
                <label className="selector-label">Color {selectedColor && <span className="selected-val">– {selectedColor}</span>}</label>
                <div className="color-options">
                  {product.colors.map((c) => (
                    <button key={c} className={`detail-color-chip ${selectedColor === c ? 'active' : ''}`} onClick={() => setSelectedColor(c)}>{c}</button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity */}
            <div className="selector-group">
              <label className="selector-label">Quantity</label>
              <div className="qty-control">
                <button className="qty-btn" onClick={() => setQuantity(Math.max(1, quantity-1))} disabled={quantity<=1}>−</button>
                <span className="qty-value">{quantity}</span>
                <button className="qty-btn" onClick={() => setQuantity(Math.min(product.stock, quantity+1))} disabled={quantity>=product.stock}>+</button>
                <span className="stock-text">{product.stock} in stock</span>
              </div>
            </div>

            {/* Actions */}
            <div className="product-actions">
              <button className="btn btn-accent btn-lg add-cart-btn" onClick={handleAddToCart} disabled={product.stock===0}>
                <FiShoppingCart/> {product.stock===0 ? 'Out of Stock' : 'Add to Cart'}
              </button>
              <button className="btn btn-primary btn-lg buy-now-btn" onClick={handleBuyNow} disabled={product.stock===0}>
                Buy Now
              </button>
              <button className="btn btn-ghost btn-icon wishlist-btn" aria-label="Wishlist"><FiHeart size={20}/></button>
            </div>

            {/* Perks */}
            <div className="product-perks">
              <div className="perk-mini"><FiTruck size={15}/> Free shipping on orders over $50</div>
              <div className="perk-mini"><FiRefreshCw size={15}/> 30-day easy returns</div>
              <div className="perk-mini"><FiShield size={15}/> 2-year quality guarantee</div>
            </div>
          </div>
        </div>

        {/* Back button */}
        <button className="btn btn-ghost back-btn" onClick={() => navigate(-1)}>
          <FiArrowLeft/> Back
        </button>
      </div>
    </div>
  );
}
