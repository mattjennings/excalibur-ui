import { test, expect, beforeEach } from '$fixture'
import * as ex from 'excalibur'
import { renderUI } from 'excalibur-ui'

beforeEach(async ({ useScene, clock }) => {
  await useScene(
    class extends ex.Scene {
      onInitialize() {
        renderUI(this, () => <div data-testid="hello">hello</div>)
      }
    },
  )

  clock.step(16)
})

test('renders html', async ({}) => {
  expect(document.body).toHaveTextContent('hello')
})
