import { configureStore } from '@reduxjs/toolkit';
import authReducer    from './slices/authSlice';
import cartReducer    from './slices/cartSlice';
import productReducer from './slices/productSlice';
import orderReducer   from './slices/orderSlice';
import adminReducer   from './slices/adminSlice';

const store = configureStore({
  reducer: {
    auth:     authReducer,
    cart:     cartReducer,
    products: productReducer,
    orders:   orderReducer,
    admin:    adminReducer,
  },
  devTools: process.env.NODE_ENV !== 'production',
});

export default store;
