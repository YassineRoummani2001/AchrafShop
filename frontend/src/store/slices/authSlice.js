import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../utils/api';

// Load user from localStorage
const userInfo = localStorage.getItem('userInfo')
  ? JSON.parse(localStorage.getItem('userInfo'))
  : null;

// ===== Async Thunks =====
export const login = createAsyncThunk('auth/login', async ({ email, password }, { rejectWithValue }) => {
  try {
    const { data } = await api.post('/auth/login', { email, password });
    localStorage.setItem('userInfo', JSON.stringify(data.data));
    return data.data;
  } catch (error) {
    return rejectWithValue(error.message);
  }
});

export const register = createAsyncThunk('auth/register', async ({ name, email, password }, { rejectWithValue }) => {
  try {
    const { data } = await api.post('/auth/register', { name, email, password });
    localStorage.setItem('userInfo', JSON.stringify(data.data));
    return data.data;
  } catch (error) {
    return rejectWithValue(error.message);
  }
});

export const getProfile = createAsyncThunk('auth/getProfile', async (_, { rejectWithValue }) => {
  try {
    const { data } = await api.get('/auth/me');
    return data.data;
  } catch (error) {
    return rejectWithValue(error.message);
  }
});

export const updateProfile = createAsyncThunk('auth/updateProfile', async (profileData, { rejectWithValue }) => {
  try {
    const { data } = await api.put('/auth/me', profileData);
    const current = JSON.parse(localStorage.getItem('userInfo') || '{}');
    localStorage.setItem('userInfo', JSON.stringify({ ...current, ...data.data }));
    return data.data;
  } catch (error) {
    return rejectWithValue(error.message);
  }
});

// ===== Slice =====
const authSlice = createSlice({
  name: 'auth',
  initialState: {
    userInfo,
    profile: null,
    loading: false,
    error: null,
  },
  reducers: {
    logout: (state) => {
      localStorage.removeItem('userInfo');
      state.userInfo = null;
      state.profile = null;
      state.error = null;
    },
    clearError: (state) => { state.error = null; },
  },
  extraReducers: (builder) => {
    const handlePending = (state) => { state.loading = true; state.error = null; };
    const handleRejected = (state, action) => { state.loading = false; state.error = action.payload; };

    builder
      .addCase(login.pending, handlePending)
      .addCase(login.fulfilled, (state, action) => { state.loading = false; state.userInfo = action.payload; })
      .addCase(login.rejected, handleRejected)
      .addCase(register.pending, handlePending)
      .addCase(register.fulfilled, (state, action) => { state.loading = false; state.userInfo = action.payload; })
      .addCase(register.rejected, handleRejected)
      .addCase(getProfile.pending, handlePending)
      .addCase(getProfile.fulfilled, (state, action) => { state.loading = false; state.profile = action.payload; })
      .addCase(getProfile.rejected, handleRejected)
      .addCase(updateProfile.pending, handlePending)
      .addCase(updateProfile.fulfilled, (state, action) => { state.loading = false; state.profile = action.payload; })
      .addCase(updateProfile.rejected, handleRejected);
  },
});

export const { logout, clearError } = authSlice.actions;
export default authSlice.reducer;
