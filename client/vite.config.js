import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  // While developing, send /api calls to the Express server
  server: { port: 5173, proxy: { '/api': 'http://localhost:5000' } },
})
