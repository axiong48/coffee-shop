import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Frontend now calls relative paths like /api/auth/login, and Vite
      // forwards them to Flask under the hood. The browser sees one origin
      // (the Vite dev server), so there's no cross-origin cookie behavior
      // for browser privacy settings (e.g. Opera GX's cookie blocking) to
      // interfere with.
      '/api': {
        target: 'http://127.0.0.1:5000',
        changeOrigin: true,
      },
    },
  },
})
