import { createSlice } from '@reduxjs/toolkit'

// The cart lives in Redux and is saved to localStorage, so it survives a page refresh.
// Shape: { items: { [dishId]: { id, name, price, isVeg, emoji, imageUrl, qty } } }
function load() {
  try {
    return JSON.parse(localStorage.getItem('rasoi_cart')) || { items: {} }
  } catch {
    return { items: {} }
  }
}

const cartSlice = createSlice({
  name: 'cart',
  initialState: load(),
  reducers: {
    addItem(state, { payload: dish }) {
      const line = state.items[dish._id]
      if (line) line.qty = Math.min(line.qty + 1, 20)
      else
        state.items[dish._id] = {
          id: dish._id, name: dish.name, price: dish.price, isVeg: dish.isVeg, emoji: dish.emoji, imageUrl: dish.imageUrl, qty: 1,
        }
    },
    removeItem(state, { payload: id }) {
      const line = state.items[id]
      if (!line) return
      line.qty -= 1
      if (line.qty <= 0) delete state.items[id]
    },
    clearCart(state) {
      state.items = {}
    },
  },
})

export const { addItem, removeItem, clearCart } = cartSlice.actions
export default cartSlice.reducer

// Selectors: small functions that read from the store
export const selectCartLines = (state) => Object.values(state.cart.items)
export const selectQty = (id) => (state) => state.cart.items[id]?.qty || 0
export const selectCartCount = (state) => Object.values(state.cart.items).reduce((n, l) => n + l.qty, 0)
