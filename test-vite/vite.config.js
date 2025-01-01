import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import { sentryVitePlugin } from '@sentry/vite-plugin'

export default defineConfig({
  build: {
    // sourcemap: true, // Source map generation must be turned on
  },
  plugins: [
    react(),
    sentryVitePlugin({
      org: 'braintrust-16',
      project: 'name',
      // release: '123',
      // telemetry: false,
      // debug: true,
    }),
  ],
})
