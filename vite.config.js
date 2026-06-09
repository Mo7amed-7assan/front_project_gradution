import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            // Group react-dom separately (largest vendor chunk)
            if (id.includes('react-dom')) return 'vendor-react-dom'
            // Group react core
            if (id.includes('react-router') || id.includes('react/')) return 'vendor-react'
            // Group all other node_modules by package name
            return id.toString().split('node_modules/')[1].split('/')[0].toString()
          }
        },
      },
    },
  },
})
