import { commands } from '@vitest/browser/context'

export async function toMatchScreenshot(
  target: any,
  name: string,
  threshold = 0.1,
) {
  const result = await commands.expectToMatchScreenshot(name, threshold)

  return {
    pass: result.equal,
    message: () => {
      if (result.equal) {
        if (!result.hadPrev) {
          console.log(`Screenshot "${name}" created`)
        }
        return `Screenshots match`
      } else {
        return `Screenshots do not match`
      }
    },
  }
}
