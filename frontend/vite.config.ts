import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwind from '@tailwindcss/vite'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwind()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@/assets': path.resolve(__dirname, './src/assets'),
      '@/api': path.resolve(__dirname, './src/api'),
      '@/common': path.resolve(__dirname, './src/common'),
      '@/features': path.resolve(__dirname, './src/features'),
      '@/libs/*': path.resolve(__dirname, './src/libs/*'),
      '@/components/*': path.resolve(__dirname, './src/components/*')
    },
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
})
