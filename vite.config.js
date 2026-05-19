import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { fileURLToPath, URL } from 'node:url'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@client': fileURLToPath(new URL('./src/apps/client', import.meta.url)),
      '@admin': fileURLToPath(new URL('./src/apps/admin', import.meta.url)),
      '@shared': fileURLToPath(new URL('./src/shared', import.meta.url)),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'ui-vendor': ['@mui/material', '@mui/icons-material', '@emotion/react', '@emotion/styled'],
          'radix-vendor': ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu'],
          'icons': ['react-icons', 'lucide-react'],
        },
      },
    },
    chunkSizeWarningLimit: 1500,
  },
})
