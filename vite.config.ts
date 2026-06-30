import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    allowedHosts: ['tirumala-devotee-app.onrender.com']
  },
  preview: {
    allowedHosts: ['tirumala-devotee-app.onrender.com']
  }
})
