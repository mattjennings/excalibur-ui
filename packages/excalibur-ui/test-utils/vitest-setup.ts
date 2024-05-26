/// <reference types="expect-dom/vitest.d.ts" />
import * as domMatchers from 'expect-dom'
import * as customMatchers from './matchers'
import { expect } from 'vitest'

expect.extend(domMatchers)
expect.extend(customMatchers)

declare module 'vitest' {
  interface JestAssertion<T = any> {
    toMatchScreenshot: (name: string, threshold?: number) => Promise<T>
  }
}
