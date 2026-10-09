import { configureStore } from '@reduxjs/toolkit'
import { api } from './api'
import authReducer from './authSlice'
import cartReducer from './cartSlice'

export const store = configureStore({
  reducer: {
    cart: cartReducer,
    auth: authReducer,
    [api.reducerPath]: api.reducer,
  },
  middleware: (getDefault) => getDefault().concat(api.middleware),
})

// Save the cart and login whenever they change
store.subscribe(() => {
  const { cart, auth } = store.getState()
  try {
    localStorage.setItem('rasoi_cart', JSON.stringify(cart))
    localStorage.setItem('rasoi_auth', JSON.stringify(auth))
  } catch {
    // storage blocked (private mode): the app still works, it just forgets on refresh
  }
})
