import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'
import { handleGasHistoryProxy } from './server/gas-history-proxy.js'

const gasHistoryDevProxy = {
  name: 'trex-gas-history-dev-proxy',
  configureServer(server) {
    server.middlewares.use('/api/history', (req, res, next) => {
      handleGasHistoryProxy(req, res).catch(next)
    })
  },
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), gasHistoryDevProxy],
})
