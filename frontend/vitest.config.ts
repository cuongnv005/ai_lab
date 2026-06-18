import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  resolve: {
    tsconfigPaths: true, // native vite: reads paths from tsconfig.json
  },
  test: {
    // ─── Environment ─────────────────────────────────────
    environment: 'jsdom',
    globals: true,
    passWithNoTests: true,

    // ─── Setup ───────────────────────────────────────────
    setupFiles: ['__tests__/setup.ts'],

    // ─── Include / Exclude ───────────────────────────────
    include: ['__tests__/tests/**/*.test.{ts,tsx}'],
    exclude: ['node_modules', '.next', 'e2e/**'],

    // ─── Coverage ────────────────────────────────────────
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      reportsDirectory: './coverage',
      include: ['features/**', 'shared/**', 'app/**'],
      exclude: [
        'node_modules/**',
        '.next/**',
        '**/*.d.ts',
        '**/*.config.*',
        '**/index.ts',
        'app/layout.tsx',
        'app/*/layout.tsx',
        'instrumentation.ts',
      ],
      thresholds: {
        statements: 80,
        branches: 75,
        functions: 80,
        lines: 80,
      },
    },

    // ─── Reporters ───────────────────────────────────────
    reporters: process.env.CI
      ? ['verbose', 'json', 'github-actions']
      : ['verbose'],

    // ─── Timeout ─────────────────────────────────────────
    testTimeout: 10_000,
    hookTimeout: 10_000,
  },
});
