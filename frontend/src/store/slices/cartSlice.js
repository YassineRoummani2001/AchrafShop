import { createSlice } from '@reduxjs/toolkit';
import { toast } from 'react-toastify';

// Load cart from localStorage
const cartItems = localStorage.getItem('cartItems')
  ? JSON.parse(localStorage.getItem('cartItems'))
  : [];

const saveToStorage = (items) => {
  localStorage.setItem('cartItems', JSON.stringify(items));
};

const cartSlice = createSlice({
  name: 'cart',
  initialState: {
    items: cartItems,
    shippingAddress: localStorage.getItem('shippingAddress')
      ? JSON.parse(localStorage.getItem('shippingAddress'))
      : {},
    paymentMethod: 'stripe',
  },
  reducers: {
    addToCart: (state, action) => {
      const { product, quantity, size, color } = action.payload;
      const existingIndex = state.items.findIndex(
        (item) => item._id === product._id && item.size === size && item.color === color
      );

      if (existingIndex >= 0) {
        state.items[existingIndex].quantity += quantity;
        toast.info('Cart quantity updated');
      } else {
        state.items.push({
          _id: product._id,
          name: product.name,
          price: product.discountPrice > 0 ? product.discountPrice : product.price,
          image: product.images[0]?.url || '',
          stock: product.stock,
          quantity,
          size: size || '',
          color: color || '',
        });
        toast.success('Added to cart!');
      }

      saveToStorage(state.items);
    },

    removeFromCart: (state, action) => {
      const { id, size, color } = action.payload;
      state.items = state.items.filter(
        (item) => !(item._id === id && item.size === size && item.color === color)
      );
      saveToStorage(state.items);
      toast.info('Item removed from cart');
    },

    updateQuantity: (state, action) => {
      const { id, size, color, quantity } = action.payload;
      const item = state.items.find(
        (i) => i._id === id && i.size === size && i.color === color
      );
      if (item) {
        item.quantity = Math.max(1, Math.min(quantity, item.stock));
        saveToStorage(state.items);
      }
    },

    clearCart: (state) => {
      state.items = [];
      localStorage.removeItem('cartItems');
    },

    saveShippingAddress: (state, action) => {
      state.shippingAddress = action.payload;
      localStorage.setItem('shippingAddress', JSON.stringify(action.payload));
    },

    setPaymentMethod: (state, action) => {
      state.paymentMethod = action.payload;
    },
  },
});

export const { addToCart, removeFromCart, updateQuantity, clearCart, saveShippingAddress, setPaymentMethod } = cartSlice.actions;

// Selectors
export const selectCartItems = (state) => state.cart.items;
export const selectCartTotal = (state) =>
  state.cart.items.reduce((acc, item) => acc + item.price * item.quantity, 0);
export const selectCartCount = (state) =>
  state.cart.items.reduce((acc, item) => acc + item.quantity, 0);

export default cartSlice.reducer;
