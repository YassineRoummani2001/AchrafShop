import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../utils/api';

// ── Async Thunks ────────────────────────────────────────────────────────────

export const fetchStats = createAsyncThunk('admin/fetchStats', async (_, { rejectWithValue }) => {
  try {
    const { data } = await api.get('/admin/stats');
    return data.data;
  } catch (e) { return rejectWithValue(e.message); }
});

export const fetchAdminUsers = createAsyncThunk('admin/fetchUsers', async (params = {}, { rejectWithValue }) => {
  try {
    const { data } = await api.get('/admin/users', { params });
    return data;
  } catch (e) { return rejectWithValue(e.message); }
});

export const updateUserRole = createAsyncThunk('admin/updateUserRole', async ({ id, role }, { rejectWithValue }) => {
  try {
    const { data } = await api.put(`/admin/users/${id}`, { role });
    return data.data;
  } catch (e) { return rejectWithValue(e.message); }
});

export const deleteAdminUser = createAsyncThunk('admin/deleteUser', async (id, { rejectWithValue }) => {
  try {
    await api.delete(`/admin/users/${id}`);
    return id;
  } catch (e) { return rejectWithValue(e.message); }
});

export const fetchAdminOrders = createAsyncThunk('admin/fetchOrders', async (params = {}, { rejectWithValue }) => {
  try {
    const { data } = await api.get('/orders', { params });
    return data;
  } catch (e) { return rejectWithValue(e.message); }
});

export const updateAdminOrderStatus = createAsyncThunk('admin/updateOrderStatus', async ({ id, status }, { rejectWithValue }) => {
  try {
    const { data } = await api.put(`/orders/${id}/status`, { orderStatus: status });
    return data.data;
  } catch (e) { return rejectWithValue(e.message); }
});


export const fetchAdminProducts = createAsyncThunk('admin/fetchProducts', async (params = {}, { rejectWithValue }) => {
  try {
    const { data } = await api.get('/products', { params: { ...params, limit: 20 } });
    return data;
  } catch (e) { return rejectWithValue(e.message); }
});

export const createAdminProduct = createAsyncThunk('admin/createProduct', async (productData, { rejectWithValue }) => {
  try {
    const { data } = await api.post('/products', productData);
    return data.data;
  } catch (e) { return rejectWithValue(e.message); }
});

export const updateAdminProduct = createAsyncThunk('admin/updateProduct', async ({ id, ...productData }, { rejectWithValue }) => {
  try {
    const { data } = await api.put(`/products/${id}`, productData);
    return data.data;
  } catch (e) { return rejectWithValue(e.message); }
});

export const deleteAdminProduct = createAsyncThunk('admin/deleteProduct', async (id, { rejectWithValue }) => {
  try {
    await api.delete(`/products/${id}`);
    return id;
  } catch (e) { return rejectWithValue(e.message); }
});

// ── Slice ────────────────────────────────────────────────────────────────────

const adminSlice = createSlice({
  name: 'admin',
  initialState: {
    stats: null,
    users: [], usersPagination: null,
    orders: [], ordersPagination: null,
    products: [], productsPagination: null,
    loading: false,
    actionLoading: false,
    error: null,
  },
  reducers: {
    clearAdminError: (state) => { state.error = null; },
  },
  extraReducers: (builder) => {
    const pending  = (state) => { state.loading = true; state.error = null; };
    const rejected = (state, a) => { state.loading = false; state.error = a.payload; };
    const aPending  = (state) => { state.actionLoading = true; };
    const aSettled  = (state) => { state.actionLoading = false; };

    builder
      // Stats
      .addCase(fetchStats.pending, pending)
      .addCase(fetchStats.fulfilled, (state, a) => { state.loading = false; state.stats = a.payload; })
      .addCase(fetchStats.rejected, rejected)
      // Users
      .addCase(fetchAdminUsers.pending, pending)
      .addCase(fetchAdminUsers.fulfilled, (state, a) => { state.loading = false; state.users = a.payload.data; state.usersPagination = a.payload.pagination; })
      .addCase(fetchAdminUsers.rejected, rejected)
      .addCase(updateUserRole.pending, aPending)
      .addCase(updateUserRole.fulfilled, (state, a) => { aSettled(state); state.users = state.users.map(u => u._id === a.payload._id ? a.payload : u); })
      .addCase(updateUserRole.rejected, (state, a) => { aSettled(state); state.error = a.payload; })
      .addCase(deleteAdminUser.pending, aPending)
      .addCase(deleteAdminUser.fulfilled, (state, a) => { aSettled(state); state.users = state.users.filter(u => u._id !== a.payload); })
      .addCase(deleteAdminUser.rejected, (state, a) => { aSettled(state); state.error = a.payload; })
      // Orders
      .addCase(fetchAdminOrders.pending, pending)
      .addCase(fetchAdminOrders.fulfilled, (state, a) => { state.loading = false; state.orders = a.payload.data; state.ordersPagination = a.payload.pagination; })
      .addCase(fetchAdminOrders.rejected, rejected)
      .addCase(updateAdminOrderStatus.pending, aPending)
      .addCase(updateAdminOrderStatus.fulfilled, (state, a) => { aSettled(state); state.orders = state.orders.map(o => o._id === a.payload._id ? a.payload : o); })
      .addCase(updateAdminOrderStatus.rejected, (state, a) => { aSettled(state); state.error = a.payload; })
      // Products
      .addCase(fetchAdminProducts.pending, pending)
      .addCase(fetchAdminProducts.fulfilled, (state, a) => { state.loading = false; state.products = a.payload.data; state.productsPagination = a.payload.pagination; })
      .addCase(fetchAdminProducts.rejected, rejected)
      .addCase(createAdminProduct.pending, aPending)
      .addCase(createAdminProduct.fulfilled, (state, a) => { aSettled(state); state.products.unshift(a.payload); })
      .addCase(createAdminProduct.rejected, (state, a) => { aSettled(state); state.error = a.payload; })
      .addCase(updateAdminProduct.pending, aPending)
      .addCase(updateAdminProduct.fulfilled, (state, a) => { aSettled(state); state.products = state.products.map(p => p._id === a.payload._id ? a.payload : p); })
      .addCase(updateAdminProduct.rejected, (state, a) => { aSettled(state); state.error = a.payload; })
      .addCase(deleteAdminProduct.pending, aPending)
      .addCase(deleteAdminProduct.fulfilled, (state, a) => { aSettled(state); state.products = state.products.filter(p => p._id !== a.payload); })
      .addCase(deleteAdminProduct.rejected, (state, a) => { aSettled(state); state.error = a.payload; });
  },
});

export const { clearAdminError } = adminSlice.actions;
export default adminSlice.reducer;
