import { test, expect, beforeEach, describe } from '$fixture'
import { createSignal } from 'solid-js'

beforeEach(async ({ useNewScene }) => {
  await useNewScene()
})

describe('creating and updating elements', () => {
  test('renders html', async ({ renderUI }) => {
    renderUI(() => <div data-testid="test">hello</div>)
    expect(document.querySelector('[data-testid=test]')).toBeInTheDocument()
  })

  test('applies styles', async ({ renderUI }) => {
    renderUI(() => (
      <div data-testid="test" style={{ padding: '20px' }}>
        hello
      </div>
    ))
    const el = document.querySelector('[data-testid=test]')
    expect(el).toHaveStyle({ padding: '20px' })
  })

  test('updates props', async ({ renderUI }) => {
    const [style, setStyle] = createSignal({ padding: '20px' })
    renderUI(() => (
      <div data-testid="test" style={style()}>
        hello
      </div>
    ))
    const el = document.querySelector('[data-testid=test]')
    expect(el).toHaveStyle({ padding: '20px' })

    setStyle({ padding: '10px' })
    expect(el).toHaveStyle({ padding: '10px' })
  })

  test('removes node', async ({ renderUI }) => {
    const [show, setShow] = createSignal(true)
    renderUI(() => <div>{show() && <div data-testid="child">child</div>}</div>)
    const el = document.querySelector('[data-testid=child]')
    expect(el).toBeInTheDocument()

    setShow(false)
    expect(el).not.toBeInTheDocument()
  })

  test('calls event handler', async ({ renderUI }) => {
    const [clicked, setClicked] = createSignal(false)
    renderUI(() => (
      <button data-testid="button" onClick={() => setClicked(true)}>
        click me
      </button>
    ))
    const el = document.querySelector('[data-testid=button]')
    el!.dispatchEvent(new MouseEvent('click'))
    expect(clicked()).toBe(true)
  })
})

describe('positioning over canvas', () => {
  test('is aligned to top left of canvas', async ({ renderUI }) => {
    renderUI(() => <div data-testid="test">hello</div>)
    const el = document.querySelector('div')
    const canvas = document.querySelector('canvas')

    const canvasRect = canvas!.getBoundingClientRect()
    const elRect = el!.getBoundingClientRect()

    expect(elRect.left).toBe(canvasRect.left)
    expect(elRect.top).toBe(canvasRect.top)
  })
})
