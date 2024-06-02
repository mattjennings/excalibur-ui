import { beforeEach, describe, expect, test } from '$fixture'
import * as ex from 'excalibur'
import { GraphicElement } from '../src/elements'

beforeEach(async ({ useNewScene }) => {
  await useNewScene()
})

const rectangle = new ex.Rectangle({
  width: 100,
  height: 100,
  color: ex.Color.Green,
})

test('renders a graphic', async ({ renderUI }) => {
  const container = renderUI<GraphicElement>(() => (
    <ex-graphic graphic={rectangle} />
  ))
  const [graphicEl] = container.children

  expect(graphicEl!).toBeInstanceOf(GraphicElement)
})

describe('props', () => {
  test('anchor', async ({ renderUI }) => {
    const container = renderUI<GraphicElement>(() => (
      <ex-graphic graphic={rectangle} anchor={ex.vec(0.5, 0.5)} />
    ))
    const graphicEl = container.children[0] as GraphicElement

    expect(graphicEl.graphics.anchor.x).toBe(0.5)
    expect(graphicEl.graphics.anchor.y).toBe(0.5)
  })

  test('opacity', async ({ renderUI }) => {
    const container = renderUI<GraphicElement>(() => (
      <ex-graphic graphic={rectangle} opacity={0.5} />
    ))
    const graphicEl = container.children[0] as GraphicElement
    expect(graphicEl.graphics.current?.opacity).toBe(0.5)
  })

  test('material', async ({ renderUI, game }) => {
    const material = game.graphicsContext.createMaterial({
      name: 'custom-material',
      fragmentSource: `#version 300 es
      precision mediump float;
      out vec4 color;
      void main() {
        color = vec4(1.0, 0.0, 0.0, 1.0);
      }`,
    })

    const container = renderUI<GraphicElement>(() => (
      <ex-graphic graphic={rectangle} material={material} />
    ))
    const graphicEl = container.children[0] as GraphicElement
    expect(graphicEl.graphics.material).toBe(material)
    await expect(game).toMatchScreenshot('material')
  })
})
