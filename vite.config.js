import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    // host: true → escucha en 0.0.0.0, accesible desde otros dispositivos de la red local
    host: true,
    port: 5173,
    strictPort: false,
    open: true,
  },
})
