import { test, expect, beforeEach } from '$fixture'
import { createSignal } from 'solid-js'
import { UIContainer } from '../src/ui-container'
import { TextElement } from '../src/elements'

beforeEach(async ({ useNewScene }) => {
  await useNewScene()
})

test('renders text', async ({ renderUI, scene, game }) => {
  renderUI(() => (
    <ex-text
      text="hello"
      font={{
        size: 60,
      }}
    />
  ))
  expect(scene.entities).toHaveLength(2)
  expect(scene.entities[0]).toBeInstanceOf(UIContainer)
  expect(scene.entities[1]).toBeInstanceOf(TextElement)
  const textEl = scene.entities[1] as TextElement
  expect(textEl.text).toBe('hello')

  await expect(game).toMatchScreenshot('text')
})

test('updates text', async ({ renderUI, scene }) => {
  const [text, setText] = createSignal('hello')
  renderUI(() => <ex-text text={text()} />)
  const textEl = scene.entities[1] as TextElement
  expect(textEl.text).toBe('hello')

  setText('world')
  expect(textEl.text).toBe('world')
})
