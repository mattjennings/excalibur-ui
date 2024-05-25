import { test, expect, beforeEach } from '$fixture'
import * as ex from 'excalibur'
import { renderUI } from 'excalibur-ui'
import { waitFor } from '$test-utils/wait'

beforeEach(async ({ useScene, clock }) => {
  await useScene(
    class extends ex.Scene {
      onInitialize() {
        renderUI(this, () => <div data-testid="hello">hello</div>)
      }
    },
  )

  await clock.step(16)
})

test('can move right', async ({}) => {
  expect(
    document.body.querySelector('[data-testid="hello"]'),
  ).toBeInTheDocument()
})
