const { defineConfig, loadEnv } = require('vite')
const react = require('@vitejs/plugin-react')

module.exports = defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  return {
    plugins: [react()],
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
