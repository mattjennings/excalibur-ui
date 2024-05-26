import { beforeEach, describe, expect, test } from '$fixture'
import * as ex from 'excalibur'
import { GraphicElement } from '../src/elements'

beforeEach(async ({ useNewScene }) => {
  await useNewScene()
})

const rectangle = new ex.Rectangle({ width: 100, height: 100 })

test('renders a graphic', async ({ renderUI }) => {
  const [graphicEl] = renderUI<GraphicElement>(() => (
    <ex-graphic graphic={rectangle} />
  ))

  expect(graphicEl!).toBeInstanceOf(GraphicElement)
})

describe('props', () => {
  test('anchor', async ({ renderUI }) => {
    const [graphicEl] = renderUI<GraphicElement>(() => (
      <ex-graphic graphic={rectangle} anchor={ex.vec(0.5, 0.5)} />
    ))

    expect(graphicEl.graphics.anchor.x).toBe(0.5)
    expect(graphicEl.graphics.anchor.y).toBe(0.5)
  })

  test('opacity', async ({ renderUI }) => {
    const [graphicEl] = renderUI<GraphicElement>(() => (
      <ex-graphic graphic={rectangle} opacity={0.5} />
    ))
    expect(graphicEl.graphics.current?.opacity).toBe(0.5)
  })
})
