/// <reference types="vitest" />
import { defineConfig } from 'vite'
import type { Browser, LaunchOptions, Page } from 'playwright'
import solidPlugin from 'vite-plugin-solid'
import path from 'path'
import fs from 'fs'
import looksSame from 'looks-same'

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
      'excalibur-ui/jsx-runtime': '/src/jsx-runtime.tsx',
      'excalibur-ui': '/src/index.tsx',
    },
  },
  plugins: [
    solidPlugin({
      solid: {
        moduleName: 'excalibur-ui/jsx-runtime',
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
      viewport: {
        width: 800,
        height: 600,
      },
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
      commands: {
        async expectToMatchScreenshot(context, name, threshold = 0.1) {
          if (context.provider.name !== 'playwright')
            throw new Error('Not implemented for provider')

          if (!context.testPath) {
            throw new Error('testPath not found')
          }

          const page = (context.provider as any).page as Page

          const folder = path.dirname(context.testPath)

          const snapshotsFolder = path.join(folder, '__snapshots__')

          if (!fs.existsSync(snapshotsFolder)) {
            fs.mkdirSync(snapshotsFolder)
          }

          const testName = slugify(
            path.basename(context.testPath).split('.')[0],
          )

          const screenshotFileName = slugify(testName + '_' + name)
          const screenshotPath = path.join(
            snapshotsFolder,
            `${screenshotFileName}.png`,
          )

          const prev = await fs.promises.readFile(screenshotPath).catch((e) => {
            if (e.code === 'ENOENT') return null
            throw e
          })

          const iframe = await page.$('iframe')

          if (!iframe) {
            throw new Error('iframe not found')
          }
          const next = await iframe!.screenshot()

          // if prev doesnt exist just compare against itself for consistent return data
          const result = await looksSame(prev ?? next, next, {
            ignoreAntialiasing: true,
            antialiasingTolerance: 3,
            pixelRatio: 1,
            tolerance: threshold,
          })

          if (!result.equal && prev) {
            const buffer = await looksSame.createDiff({
              current: next,
              reference: prev,
              tolerance: threshold,
              highlightColor: '#ff0000',
            })

            const diffPath = path.join(
              snapshotsFolder,
              `${screenshotFileName}.diff.png`,
            )
            const actualPath = path.join(
              snapshotsFolder,
              `${screenshotFileName}.actual.png`,
            )
            await fs.promises.writeFile(diffPath, buffer, 'utf-8')
            await fs.promises.writeFile(actualPath, next)
          } else {
            await fs.promises.writeFile(screenshotPath, next)
          }

          return { ...result, hadPrev: !!prev }
        },
        async enablePageLogs(context) {
          if (context.provider.name !== 'playwright')
            throw new Error('Not implemented for provider')

          if (!context.testPath) {
            throw new Error('testPath not found')
          }

          const page = (context.provider as any).page as Page

          const listener = (msg: any) => {
            console.log(`[${msg.type()}] ${msg.text()}`)
          }
          page.on('console', listener)

          page.on('close', () => {
            page.off('console', listener)
          })
        },
      },
    },
  },
})

function slugify(str: string) {
  return str.toLowerCase().replace(/\s/g, '-')
}

declare module '@vitest/browser/context' {
  interface BrowserCommands {
    screenshot: (name: string) => Promise<number[]>
    resizePage: (width: number, height: number) => Promise<void>
    expectToMatchScreenshot: (
      name: string,
      threshold?: number,
    ) => Promise<looksSame.LooksSameBaseResult & { hadPrev?: boolean }>
    enablePageLogs: () => void
  }
}
