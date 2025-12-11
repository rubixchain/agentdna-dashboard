import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],

  server: {
    port: 4001,      // change port
    host: true,      // allow access from network (0.0.0.0)
    strictPort: true // prevents auto-switching if port is busy
  }
})