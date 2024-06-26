import {
  Engine,
  Entity,
  GraphicsComponent,
  TransformComponent,
  Vector,
} from 'excalibur'
import { JSXElement } from 'solid-js'
import { render } from './runtime'
import { ViewElement } from './elements'

/**
 * When 'native' the UI will be sized to the actual "css" pixels of the canvas.
 * In other words, it will be a higher resolution for devices that support it.
 * 1em in CSS = 1px in the game. You can also multiply by the --px variable with calc().
 *
 * When 'scaled' the UI will be sized to the resolution of the game and scaled
 * up to fit the canvas. In other words, it will match the resolution of the game.
 * 1px in CSS = 1px in the game.
 */
export type Resolution = 'native' | 'scaled'

export class UIContainer extends Entity {
  htmlElement: HTMLElement
  engine!: Engine
  resolution: Resolution
  resizeObserver: ResizeObserver | null = null

  parentElement!: HTMLElement

  transform: TransformComponent
  graphics: GraphicsComponent

  private ui: () => JSXElement

  constructor(
    ui: () => JSXElement,
    {
      tag = 'div',
      id,
      parent = document.body,
      resolution = 'scaled',
    }: {
      tag?: string
      id?: string
      parent?: HTMLElement
      resolution?: Resolution
    } = {},
  ) {
    super()
    this.ui = ui
    this.resolution = resolution
    this.htmlElement = document.createElement(tag)
    this.htmlElement.style.position = 'absolute'
    this.htmlElement.style.pointerEvents = 'none'

    if (id) {
      this.htmlElement.id = id
    }

    this.parentElement = parent

    this.transform = new TransformComponent()
    this.graphics = new GraphicsComponent()
    this.graphics.anchor = Vector.Zero
    this.addComponent(this.transform)
    this.addComponent(this.graphics)

    this.resizeObserver = new ResizeObserver(() => {
      this.resizeToCanvas()
    })
    this.resizeObserver.observe(document.body)

    this.onPreUpdate = () => {
      if (this.htmlElement) {
        this.htmlElement.style.opacity = this.graphics.opacity.toString()
      }
    }
  }

  kill() {
    this.parentElement.removeChild(this.htmlElement)
    this.htmlElement.remove()
    this.resizeObserver?.disconnect()
    super.kill()
  }

  onInitialize(engine: Engine): void {
    this.engine = engine
    this.parentElement.appendChild(this.htmlElement)
    this.resizeToCanvas()

    const scene = this.scene!

    scene.once('predraw', () => {
      render(this.ui as any, this)
    })

    scene.on('activate', () => {
      this.show()
    })

    scene.on('deactivate', () => {
      this.hide()
    })
  }

  show() {
    this.htmlElement.removeAttribute('hidden')
  }

  hide() {
    this.htmlElement.setAttribute('hidden', '')
  }

  resizeToCanvas = () => {
    if (this.htmlElement && this.engine?.canvas) {
      const { width, height, left, top, bottom, right } =
        this.engine.canvas.getBoundingClientRect()

      const scaledWidth = width / this.engine.drawWidth
      const scaledHeight = height / this.engine.drawHeight

      this.htmlElement.style.top = `${top}px`
      this.htmlElement.style.left = `${left}px`
      this.htmlElement.style.bottom = `${bottom}px`
      this.htmlElement.style.right = `${right}px`
      this.htmlElement.style.overflow = 'hidden'

      if (this.resolution === 'scaled') {
        this.htmlElement.style.width = `${this.engine.drawWidth}px`
        this.htmlElement.style.height = `${this.engine.drawHeight}px`
        this.htmlElement.style.transform = `scale(${scaledWidth}, ${scaledHeight})`
        this.htmlElement.style.transformOrigin = '0 0'
        this.htmlElement.style.setProperty('--px', `1px`)
      } else {
        this.htmlElement.style.width = `${width}px`
        this.htmlElement.style.height = `${height}px`
        this.htmlElement.style.fontSize = `${
          scaledWidth > scaledHeight ? scaledWidth : scaledHeight
        }px`
        this.htmlElement.style.setProperty('--px', `${scaledWidth}px`)
      }
    }
  }

  get children(): ViewElement[] {
    return super.children as ViewElement[]
  }
}
