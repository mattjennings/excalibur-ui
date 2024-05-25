import { UIElement } from './ui-element'

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

export class UIContainer extends UIElement {
  htmlRootElement: HTMLElement
  engine!: ex.Engine
  resolution: Resolution
  resizeObserver: ResizeObserver | null = null

  parentElement!: HTMLElement

  constructor({
    tag = 'div',
    id,
    parent = document.body,
    resolution = 'scaled',
  }: {
    tag?: string
    id?: string
    parent?: HTMLElement
    resolution?: Resolution
  } = {}) {
    super()
    this.resolution = resolution
    this.htmlRootElement = document.createElement(tag)
    this.htmlRootElement.style.position = 'absolute'

    if (id) {
      this.htmlRootElement.id = id
    }

    this.parentElement = parent
    this.parentElement.appendChild(this.htmlRootElement)

    this.resizeObserver = new ResizeObserver(() => {
      this.resizeToCanvas()
    })
    this.resizeObserver.observe(document.body)

    this.onPreUpdate = () => {
      if (this.htmlRootElement) {
        this.htmlRootElement.style.opacity = this.graphics.opacity.toString()
      }
    }
  }

  onInitialize(engine: ex.Engine): void {
    this.engine = engine
    this.resizeToCanvas()
    this.engine.currentScene.on('activate', () => {
      if (!this.htmlRootElement.parentElement) {
        this.parentElement.appendChild(this.htmlRootElement)
      }
    })

    this.engine.currentScene.on('deactivate', () => {
      this.htmlRootElement.parentElement?.removeChild(this.htmlRootElement)
    })
  }

  resizeToCanvas = () => {
    if (this.htmlRootElement && this.engine?.canvas) {
      const { width, height, left, top, bottom, right } =
        this.engine.canvas.getBoundingClientRect()

      const scaledWidth = width / this.engine.drawWidth
      const scaledHeight = height / this.engine.drawHeight

      this.htmlRootElement.style.top = `${top}px`
      this.htmlRootElement.style.left = `${left}px`
      this.htmlRootElement.style.bottom = `${bottom}px`
      this.htmlRootElement.style.right = `${right}px`
      this.htmlRootElement.style.overflow = 'hidden'

      if (this.resolution === 'scaled') {
        this.htmlRootElement.style.width = `${this.engine.drawWidth}px`
        this.htmlRootElement.style.height = `${this.engine.drawHeight}px`
        this.htmlRootElement.style.transform = `scale(${scaledWidth}, ${scaledHeight})`
        this.htmlRootElement.style.transformOrigin = '0 0'
      } else {
        this.htmlRootElement.style.width = `${width}px`
        this.htmlRootElement.style.height = `${height}px`
        this.htmlRootElement.style.fontSize = `${
          scaledWidth > scaledHeight ? scaledWidth : scaledHeight
        }px`
        this.htmlRootElement.style.setProperty('--px', `${scaledWidth}px`)
      }
    }
  }

  onPreKill() {
    this.htmlRootElement.remove()
    this.resizeObserver?.disconnect()
  }
}
