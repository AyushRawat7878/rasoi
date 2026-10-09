import { createSlice } from '@reduxjs/toolkit'

// Who is logged in. The token is saved so you stay logged in after a refresh.
function load() {
  try {
    return JSON.parse(localStorage.getItem('rasoi_auth')) || { token: null, user: null }
  } catch {
    return { token: null, user: null }
  }
}

const authSlice = createSlice({
  name: 'auth',
  initialState: load(),
  reducers: {
    loggedIn(state, { payload }) {
      state.token = payload.token
      state.user = payload.user
    },
    userUpdated(state, { payload }) {
      state.user = payload
    },
    loggedOut(state) {
      state.token = null
      state.user = null
    },
  },
})

export const { loggedIn, userUpdated, loggedOut } = authSlice.actions
export default authSlice.reducer
export const selectUser = (state) => state.auth.user
