import { Engine, Entity, Vector } from 'excalibur'

export class HTMLContainer extends Entity {
  htmlElement: HTMLElement
  parentElement!: HTMLElement
  engine!: Engine
  resizeObserver: ResizeObserver | null = null

  scale = new Vector(1, 1)

  constructor({
    tag = 'div',
    id,
  }: {
    tag?: string
    id?: string
  } = {}) {
    super()
    this.htmlElement = document.createElement(tag)
    this.htmlElement.style.position = 'absolute'
    this.htmlElement.style.pointerEvents = 'none'

    if (id) {
      this.htmlElement.id = id
    }

    this.resizeObserver = new ResizeObserver(() => {
      this.resizeToCanvas()
    })
    this.resizeObserver.observe(document.body)
  }

  onInitialize(engine: Engine<any>): void {
    this.engine = engine
    this.parentElement = engine.canvas.parentElement!
    this.parentElement.appendChild(this.htmlElement)
    this.resizeToCanvas()

    const scene = this.scene!

    scene.on('activate', () => {
      this.show()
    })

    scene.on('deactivate', () => {
      this.hide()
    })
  }

  kill() {
    this.parentElement.removeChild(this.htmlElement)
    this.htmlElement.remove()
    this.resizeObserver?.disconnect()
    super.kill()
  }

  show() {
    this.htmlElement.removeAttribute('hidden')
  }

  hide() {
    this.htmlElement.setAttribute('hidden', '')
  }

  resizeToCanvas() {
    if (this.htmlElement && this.engine?.canvas) {
      this.emit('resize')

      const { width, height, left, top, bottom, right } =
        this.engine.canvas.getBoundingClientRect()

      const scaledWidth = width / this.engine.drawWidth
      const scaledHeight = height / this.engine.drawHeight
      this.scale.x = scaledWidth
      this.scale.y = scaledHeight

      this.htmlElement.style.top = `${top}px`
      this.htmlElement.style.left = `${left}px`
      this.htmlElement.style.bottom = `${bottom}px`
      this.htmlElement.style.right = `${right}px`
      this.htmlElement.style.overflow = 'hidden'

      this.htmlElement.style.width = `${this.engine.drawWidth}px`
      this.htmlElement.style.height = `${this.engine.drawHeight}px`
      this.htmlElement.style.transform = `scale(${scaledWidth}, ${scaledHeight})`
      this.htmlElement.style.transformOrigin = '0 0'
      this.htmlElement.style.setProperty('--px', `1px`)
    }
  }
}
