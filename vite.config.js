import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/axiom-eot/',   // change to '/' for custom domain
  build: {
    outDir: 'dist',
    sourcemap: false,
  }
})
