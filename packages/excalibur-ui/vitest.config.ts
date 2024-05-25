/// <reference types="vitest" />
import { defineConfig } from 'vite'
import type { Browser, LaunchOptions } from 'playwright'
import solidPlugin from 'vite-plugin-solid'

interface BrowserProviderOptions {
  launch?: LaunchOptions
  page?: Parameters<Browser['newPage']>[0]
}

export default defineConfig({
  optimizeDeps: {
    force: true,
  },
  resolve: {
    alias: {
      '$test-utils': '/test-utils',
      $fixture: '/test-utils/fixture.ts',
      'excalibur-ui': '/src/index.tsx',
    },
  },
  plugins: [
    solidPlugin({
      solid: {
        moduleName: 'excalibur-ui',
        generate: 'universal',
      },
    }),
  ],
  test: {
    setupFiles: ['/test-utils/vitest-setup.ts'],
    reporters: process.env.GITHUB_ACTIONS
      ? ['dot', 'github-actions']
      : 'default',
    browser: {
      enabled: true,
      isolate: true,
      headless: true, // uncomment to debug
      name: 'chromium',
      provider: 'playwright',
      providerOptions: {
        launch: {
          channel: 'chromium',
          devtools: true,
        },
      } as BrowserProviderOptions,
    },
  },
})
