import { beforeEach, describe, expect, test } from '$fixture'
import * as ex from 'excalibur'
import { ViewElement } from '../src/elements'
import { UIContainer } from '../src/ui-container'

beforeEach(async ({ useNewScene }) => {
  await useNewScene()
})

test('renders a view inside a UIContainer', async ({ renderUI, scene }) => {
  renderUI(() => <ex-view pos={ex.vec(100, 100)} />)
  expect(scene.entities).toHaveLength(2)
  expect(scene.entities[0]).toBeInstanceOf(UIContainer)
  expect(scene.entities[1]).toBeInstanceOf(ViewElement)
  const viewEl = scene.entities[1] as ViewElement
  expect(viewEl.transform.pos.x).toBe(100)
  expect(viewEl.transform.pos.y).toBe(100)
})

describe('props', () => {
  test('pos', async ({ renderUI }) => {
    const [el] = renderUI(() => <ex-view pos={ex.vec(100, 100)} />)

    expect(el.transform.pos.x).toBe(100)
    expect(el.transform.pos.y).toBe(100)
  })

  test('x', async ({ renderUI }) => {
    const [el] = renderUI(() => <ex-view x={100} />)

    expect(el.transform.pos.x).toBe(100)
  })

  test('y', async ({ renderUI }) => {
    const [el] = renderUI(() => <ex-view y={100} />)

    expect(el.transform.pos.y).toBe(100)
  })

  test('z', async ({ renderUI }) => {
    const [el] = renderUI(() => <ex-view z={100} />)

    expect(el.transform.z).toBe(100)
  })

  test('width', async ({ renderUI }) => {
    const [el] = renderUI(() => <ex-view width={100} />)

    expect(el.localBounds.width).toBe(100)
  })

  test('height', async ({ renderUI }) => {
    const [el] = renderUI(() => <ex-view height={100} />)
    expect(el.localBounds.height).toBe(100)
  })
})

describe('html', () => {
  test('renders html', async ({ renderUI }) => {
    renderUI(() => (
      <ex-view html={() => <div data-testid="test">Hello</div>}></ex-view>
    ))
    expect(document.querySelector('[data-testid=test]')).toBeInTheDocument()
  })
})
