import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  server: {
    port: 3000,
    // Only used when VITE_API_BASE_URL=/api (see src/api.js)
    proxy: {
      '/api': 'http://127.0.0.1:8001'
    }
  }
})
