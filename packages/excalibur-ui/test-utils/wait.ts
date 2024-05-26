export async function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export async function waitFor(
  condition: () => boolean,
  interval = 16,
  timeout = 5000,
): Promise<void> {
  const start = Date.now()
  return new Promise((resolve, reject) => {
    const check = () => {
      if (condition()) {
        resolve()
      } else if (Date.now() - start > timeout) {
        reject(new Error('Timeout'))
      } else {
        setTimeout(check, interval)
      }
    }
    check()
  })
}
