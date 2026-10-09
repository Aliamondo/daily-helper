import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: '/daily-helper/',
  plugins: [react()],
  test: {
    environment: 'jsdom',
    // Reuses one jsdom per worker instead of one per test file, still isolated
    pool: 'vmThreads',
    globals: true,
    setupFiles: './src/setupTests.ts',
    coverage: {
      // Logic only: components and views are left to E2E/integration tests
      include: ['src/helpers/**', 'src/hooks/**'],
      thresholds: { lines: 90, functions: 90, branches: 90, statements: 90 },
    },
  },
})
