import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    target: 'esnext' //browsers can handle the latest ES features
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
      '@chat': path.resolve(__dirname, 'src/pages/Chat'),
    }
  }
})
