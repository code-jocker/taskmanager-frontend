const { defineConfig, loadEnv } = require('vite')
const react = require('@vitejs/plugin-react')

module.exports = defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  return {
    plugins: [react()],
    build: {
      chunkSizeWarningLimit: 1000,
      rollupOptions: {
        output: {
          manualChunks: {
            vendor:  ['react', 'react-dom', 'react-router-dom'],
            ui:      ['lucide-react', 'clsx', 'react-hot-toast'],
            forms:   ['react-hook-form', '@hookform/resolvers', 'zod'],
            charts:  ['recharts'],
            axios:   ['axios'],
          }
        }
      }
    },
    server: {
      port: 3000,
      proxy: {
        '/api': {
          target: env.VITE_API_URL || 'https://taskmanager-backend-1-9yaq.onrender.com',
          changeOrigin: true,
          secure: true,
        }
      }
    }
  }
})
