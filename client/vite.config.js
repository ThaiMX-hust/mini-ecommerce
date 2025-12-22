import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'happy-dom', // was 'jsdom' -> use happy-dom to avoid parse5 ESM error
    setupFiles: './src/test/setup.js',
  },
  server: {
    port: 8000
  }
})
