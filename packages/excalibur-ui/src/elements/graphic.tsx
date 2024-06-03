import { BoundingBox, Color, GraphicsComponent, Vector } from 'excalibur'
import { createExElement } from '.'
import { ViewElement, ViewProps } from './view'

export default createExElement({
  init() {
    return new GraphicElement()
  },
  applyProp(instance, prop, value) {
    switch (prop) {
      default:
        // @ts-ignore
        instance[prop] = value
    }
  },
})

export interface GraphicProps<T extends GraphicElement = GraphicElement>
  extends ViewProps<T> {
  graphic: ex.Graphic
  material?: ex.Material
}

export class GraphicElement extends ViewElement {
  protected _graphics!: GraphicsComponent

  constructor() {
    super()
    this._graphics = new GraphicsComponent()
    this.graphics.anchor = Vector.Zero
    this.addComponent(this._graphics)
  }

  get anchor() {
    return this.graphics.anchor
  }

  set anchor(value: Vector) {
    this.graphics.anchor = value
  }

  get graphics() {
    return this._graphics
  }

  get graphic(): ex.Graphic | undefined {
    return this.graphics.current
  }

  set graphic(value: ex.Graphic | undefined) {
    if (this.graphics.current) {
      this.graphics.remove('default')
    }

    if (value) {
      this.graphics.add('default', value)
      this.localBounds = new BoundingBox(0, 0, value.width, value.height)
    } else {
      this.localBounds = new BoundingBox(0, 0, 0, 0)
    }
  }

  get height() {
    return super.height
  }

  get width() {
    return super.width
  }

  get opacity() {
    return this.graphics.current?.opacity ?? 1
  }

  set opacity(value: number) {
    if (!this.graphics.current) return
    this.graphics.current.opacity = value
  }

  set material(value: ex.Material | null | undefined) {
    this.graphics.material = value ?? null
  }

  get material(): ex.Material | null {
    return this.graphics.material
  }

  syncLayout(): void {
    const style = this.htmlElement!.style

    if (this.graphic) {
      if (typeof this.layout.width === 'undefined') {
        // let graphic determine width
        style.width = this.graphic.width + 'px'
      }

      if (typeof this.layout.height === 'undefined') {
        style.height = this.graphic.height + 'px'
      }
    }

    super.syncLayout()
  }
}
