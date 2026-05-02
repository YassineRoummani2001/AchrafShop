import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../utils/api';

// ===== Async Thunks =====
export const fetchProducts = createAsyncThunk('products/fetchAll', async (params, { rejectWithValue }) => {
  try {
    const queryString = new URLSearchParams(params).toString();
    const { data } = await api.get(`/products?${queryString}`);
    return data;
  } catch (error) {
    return rejectWithValue(error.message);
  }
});

export const fetchFeaturedProducts = createAsyncThunk('products/featured', async (_, { rejectWithValue }) => {
  try {
    const { data } = await api.get('/products/featured');
    return data.data;
  } catch (error) {
    return rejectWithValue(error.message);
  }
});

export const fetchProductById = createAsyncThunk('products/fetchOne', async (id, { rejectWithValue }) => {
  try {
    const { data } = await api.get(`/products/${id}`);
    return data.data;
  } catch (error) {
    return rejectWithValue(error.message);
  }
});

export const fetchCategories = createAsyncThunk('products/categories', async (params, { rejectWithValue }) => {
  try {
    const query = params ? new URLSearchParams(params).toString() : '';
    const { data } = await api.get(`/categories?${query}`);
    return data.data;
  } catch (error) {
    return rejectWithValue(error.message);
  }
});

export const addReview = createAsyncThunk('products/addReview', async ({ id, rating, comment }, { rejectWithValue }) => {
  try {
    const { data } = await api.post(`/products/${id}/reviews`, { rating, comment });
    return data;
  } catch (error) {
    return rejectWithValue(error.message);
  }
});

// ===== Admin thunks =====
export const createProduct = createAsyncThunk('products/create', async (productData, { rejectWithValue }) => {
  try {
    const { data } = await api.post('/products', productData);
    return data.data;
  } catch (error) {
    return rejectWithValue(error.message);
  }
});

export const updateProduct = createAsyncThunk('products/update', async ({ id, ...productData }, { rejectWithValue }) => {
  try {
    const { data } = await api.put(`/products/${id}`, productData);
    return data.data;
  } catch (error) {
    return rejectWithValue(error.message);
  }
});

export const deleteProduct = createAsyncThunk('products/delete', async (id, { rejectWithValue }) => {
  try {
    await api.delete(`/products/${id}`);
    return id;
  } catch (error) {
    return rejectWithValue(error.message);
  }
});

// ===== Slice =====
const productSlice = createSlice({
  name: 'products',
  initialState: {
    products: [],
    featured: [],
    currentProduct: null,
    categories: [],
    pagination: {},
    loading: false,
    error: null,
    filters: { gender: '', type: '', category: '', minPrice: '', maxPrice: '', sort: 'newest', search: '', page: 1 },
  },
  reducers: {
    setFilters: (state, action) => { state.filters = { ...state.filters, ...action.payload, page: 1 }; },
    setPage: (state, action) => { state.filters.page = action.payload; },
    clearCurrentProduct: (state) => { state.currentProduct = null; },
    clearError: (state) => { state.error = null; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.products = action.payload.data;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchProducts.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
      .addCase(fetchFeaturedProducts.fulfilled, (state, action) => { state.featured = action.payload; })
      .addCase(fetchProductById.pending, (state) => { state.loading = true; state.error = null; state.currentProduct = null; })
      .addCase(fetchProductById.fulfilled, (state, action) => { state.loading = false; state.currentProduct = action.payload; })
      .addCase(fetchProductById.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
      .addCase(fetchCategories.fulfilled, (state, action) => { state.categories = action.payload; })
      .addCase(createProduct.fulfilled, (state, action) => { state.products.unshift(action.payload); })
      .addCase(updateProduct.fulfilled, (state, action) => {
        const idx = state.products.findIndex((p) => p._id === action.payload._id);
        if (idx !== -1) state.products[idx] = action.payload;
      })
      .addCase(deleteProduct.fulfilled, (state, action) => {
        state.products = state.products.filter((p) => p._id !== action.payload);
      });
  },
});

export const { setFilters, setPage, clearCurrentProduct, clearError } = productSlice.actions;
export default productSlice.reducer;
