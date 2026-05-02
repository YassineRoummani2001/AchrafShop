import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../utils/api';

export const createOrder = createAsyncThunk('orders/create', async (orderData, { rejectWithValue }) => {
  try {
    const { data } = await api.post('/orders', orderData);
    return data.data;
  } catch (error) {
    return rejectWithValue(error.message);
  }
});

export const fetchMyOrders = createAsyncThunk('orders/myOrders', async (_, { rejectWithValue }) => {
  try {
    const { data } = await api.get('/orders/my');
    return data.data;
  } catch (error) {
    return rejectWithValue(error.message);
  }
});

export const fetchOrderById = createAsyncThunk('orders/fetchOne', async (id, { rejectWithValue }) => {
  try {
    const { data } = await api.get(`/orders/${id}`);
    return data.data;
  } catch (error) {
    return rejectWithValue(error.message);
  }
});

export const fetchAllOrders = createAsyncThunk('orders/fetchAll', async (params, { rejectWithValue }) => {
  try {
    const query = params ? new URLSearchParams(params).toString() : '';
    const { data } = await api.get(`/orders?${query}`);
    return data;
  } catch (error) {
    return rejectWithValue(error.message);
  }
});

export const updateOrderStatus = createAsyncThunk('orders/updateStatus', async ({ id, ...statusData }, { rejectWithValue }) => {
  try {
    const { data } = await api.put(`/orders/${id}/status`, statusData);
    return data.data;
  } catch (error) {
    return rejectWithValue(error.message);
  }
});

const orderSlice = createSlice({
  name: 'orders',
  initialState: {
    orders: [],
    currentOrder: null,
    myOrders: [],
    allOrders: [],
    pagination: {},
    loading: false,
    error: null,
    success: false,
  },
  reducers: {
    clearOrderState: (state) => { state.currentOrder = null; state.success = false; state.error = null; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createOrder.pending, (state) => { state.loading = true; state.error = null; state.success = false; })
      .addCase(createOrder.fulfilled, (state, action) => { state.loading = false; state.currentOrder = action.payload; state.success = true; })
      .addCase(createOrder.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
      .addCase(fetchMyOrders.pending, (state) => { state.loading = true; })
      .addCase(fetchMyOrders.fulfilled, (state, action) => { state.loading = false; state.myOrders = action.payload; })
      .addCase(fetchMyOrders.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
      .addCase(fetchOrderById.pending, (state) => { state.loading = true; })
      .addCase(fetchOrderById.fulfilled, (state, action) => { state.loading = false; state.currentOrder = action.payload; })
      .addCase(fetchOrderById.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
      .addCase(fetchAllOrders.pending, (state) => { state.loading = true; })
      .addCase(fetchAllOrders.fulfilled, (state, action) => { state.loading = false; state.allOrders = action.payload.data; state.pagination = action.payload.pagination; })
      .addCase(fetchAllOrders.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
      .addCase(updateOrderStatus.fulfilled, (state, action) => {
        const idx = state.allOrders.findIndex((o) => o._id === action.payload._id);
        if (idx !== -1) state.allOrders[idx] = action.payload;
      });
  },
});

export const { clearOrderState } = orderSlice.actions;
export default orderSlice.reducer;
