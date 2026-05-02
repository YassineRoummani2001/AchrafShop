import React, { useState, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';
import { fetchProducts, fetchCategories, setFilters, setPage } from '../../store/slices/productSlice';
import ProductCard from '../../components/ProductCard/ProductCard';
import { FiFilter, FiX, FiChevronDown, FiSearch } from 'react-icons/fi';
import './ShopPage.css';

const GENDERS  = ['men', 'women', 'kids', 'unisex'];
const TYPES    = ['clothes', 'shoes', 'accessories'];
const SORT_OPTIONS = [
  { value: 'newest',     label: 'Newest First' },
  { value: 'price_asc',  label: 'Price: Low → High' },
  { value: 'price_desc', label: 'Price: High → Low' },
  { value: 'rating',     label: 'Top Rated' },
  { value: 'popular',    label: 'Most Popular' },
];

export default function ShopPage() {
  const dispatch   = useDispatch();
  const navigate   = useNavigate();
  const { search } = useLocation();
  const { products, categories, pagination, loading, filters } = useSelector((s) => s.products);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [localFilters, setLocalFilters] = useState({ ...filters });
  const [searchInput, setSearchInput] = useState('');

  /* Sync URL query params → filters on first load */
  useEffect(() => {
    const params = new URLSearchParams(search);
    const urlFilters = {};
    if (params.get('gender'))   urlFilters.gender   = params.get('gender');
    if (params.get('type'))     urlFilters.type     = params.get('type');
    if (params.get('search'))   urlFilters.search   = params.get('search');
    if (params.get('featured')) urlFilters.featured = params.get('featured');
    if (Object.keys(urlFilters).length) {
      dispatch(setFilters(urlFilters));
      setLocalFilters((p) => ({ ...p, ...urlFilters }));
      if (urlFilters.search) setSearchInput(urlFilters.search);
    }
    // eslint-disable-next-line
  }, []);

  /* Fetch products whenever redux filters change */
  useEffect(() => {
    const clean = Object.fromEntries(Object.entries(filters).filter(([, v]) => v !== ''));
    dispatch(fetchProducts(clean));
    dispatch(fetchCategories());
  }, [dispatch, filters]);

  const applyFilters = useCallback(() => {
    dispatch(setFilters({ ...localFilters, search: searchInput }));
    setSidebarOpen(false);
    navigate('/shop', { replace: true });
  }, [dispatch, localFilters, searchInput, navigate]);

  const resetFilters = () => {
    const empty = { gender:'', type:'', category:'', minPrice:'', maxPrice:'', sort:'newest', search:'', featured:'' };
    setLocalFilters(empty);
    setSearchInput('');
    dispatch(setFilters(empty));
    navigate('/shop', { replace: true });
  };

  const handleSortChange = (e) => {
    dispatch(setFilters({ sort: e.target.value }));
    setLocalFilters((p) => ({ ...p, sort: e.target.value }));
  };

  const FilterSidebar = () => (
    <aside className={`shop-sidebar ${sidebarOpen ? 'open' : ''}`}>
      <div className="sidebar-header">
        <h3>Filters</h3>
        <button onClick={() => setSidebarOpen(false)} className="sidebar-close"><FiX/></button>
      </div>

      {/* Search */}
      <div className="filter-group">
        <label className="filter-label">Search</label>
        <div className="search-input-wrap">
          <FiSearch className="search-input-icon" />
          <input
            type="text"
            placeholder="Search products..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="form-input search-filter-input"
            onKeyDown={(e) => e.key === 'Enter' && applyFilters()}
          />
        </div>
      </div>

      {/* Gender */}
      <div className="filter-group">
        <label className="filter-label">Gender</label>
        <div className="filter-chips">
          {GENDERS.map((g) => (
            <button
              key={g}
              className={`filter-chip ${localFilters.gender === g ? 'active' : ''}`}
              onClick={() => setLocalFilters((p) => ({ ...p, gender: p.gender === g ? '' : g }))}
            >
              {g.charAt(0).toUpperCase() + g.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Type */}
      <div className="filter-group">
        <label className="filter-label">Category</label>
        <div className="filter-chips">
          {TYPES.map((t) => (
            <button
              key={t}
              className={`filter-chip ${localFilters.type === t ? 'active' : ''}`}
              onClick={() => setLocalFilters((p) => ({ ...p, type: p.type === t ? '' : t }))}
            >
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div className="filter-group">
        <label className="filter-label">Price Range</label>
        <div className="price-range-row">
          <input
            type="number" min="0" placeholder="Min"
            value={localFilters.minPrice}
            onChange={(e) => setLocalFilters((p) => ({ ...p, minPrice: e.target.value }))}
            className="form-input price-input"
          />
          <span className="price-separator">–</span>
          <input
            type="number" min="0" placeholder="Max"
            value={localFilters.maxPrice}
            onChange={(e) => setLocalFilters((p) => ({ ...p, maxPrice: e.target.value }))}
            className="form-input price-input"
          />
        </div>
      </div>

      <div className="filter-actions">
        <button className="btn btn-primary" onClick={applyFilters}>Apply Filters</button>
        <button className="btn btn-ghost" onClick={resetFilters}>Reset</button>
      </div>
    </aside>
  );

  return (
    <div className="shop-page">
      <div className="container shop-layout">
        {/* Sidebar */}
        <FilterSidebar />
        {sidebarOpen && <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)}/>}

        {/* Main content */}
        <div className="shop-main">
          {/* Toolbar */}
          <div className="shop-toolbar">
            <div className="toolbar-left">
              <button className="btn btn-outline btn-sm filter-toggle-btn" onClick={() => setSidebarOpen(true)}>
                <FiFilter /> Filters
              </button>
              {pagination.total !== undefined && (
                <span className="result-count">{pagination.total} products found</span>
              )}
            </div>
            <div className="toolbar-right">
              <div className="sort-select-wrap">
                <select className="sort-select" value={filters.sort} onChange={handleSortChange}>
                  {SORT_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
                <FiChevronDown className="sort-arrow"/>
              </div>
            </div>
          </div>

          {/* Active filter chips */}
          {(filters.gender || filters.type || filters.search || filters.minPrice || filters.maxPrice) && (
            <div className="active-filters">
              {filters.gender  && <span className="active-chip">{filters.gender} <button onClick={() => dispatch(setFilters({gender:''}))}>×</button></span>}
              {filters.type    && <span className="active-chip">{filters.type}   <button onClick={() => dispatch(setFilters({type:''}))}>×</button></span>}
              {filters.search  && <span className="active-chip">"{filters.search}" <button onClick={() => dispatch(setFilters({search:''}))}>×</button></span>}
              {(filters.minPrice||filters.maxPrice) && (
                <span className="active-chip">
                  ${filters.minPrice||0} – ${filters.maxPrice||'∞'}
                  <button onClick={() => dispatch(setFilters({minPrice:'', maxPrice:''}))}>×</button>
                </span>
              )}
              <button className="clear-all-btn" onClick={resetFilters}>Clear all</button>
            </div>
          )}

          {/* Products grid */}
          {loading ? (
            <div className="loading-overlay" style={{minHeight:'400px'}}>
              <div className="spinner"/>
            </div>
          ) : products.length === 0 ? (
            <div className="empty-state">
              <FiSearch size={48}/>
              <h3>No products found</h3>
              <p>Try adjusting your filters or search term.</p>
              <button className="btn btn-accent" onClick={resetFilters}>Clear Filters</button>
            </div>
          ) : (
            <>
              <div className="products-grid">
                {products.map((p) => <ProductCard key={p._id} product={p}/>)}
              </div>

              {/* Pagination */}
              {pagination.pages > 1 && (
                <div className="pagination">
                  {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((pg) => (
                    <button
                      key={pg}
                      className={`page-btn ${filters.page === pg ? 'active' : ''}`}
                      onClick={() => { dispatch(setPage(pg)); window.scrollTo({top:0,behavior:'smooth'}); }}
                    >
                      {pg}
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
