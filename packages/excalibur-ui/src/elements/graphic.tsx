import { BoundingBox, GraphicsComponent, Vector } from 'excalibur'
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
  private _graphics!: GraphicsComponent

  private _width: number | undefined
  private _height: number | undefined

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

      // if width/height has been set, apply it to the graphic
      if (typeof this._width === 'number') {
        value.width = this._width
      }

      if (typeof this._height === 'number') {
        value.height = this._height
      }

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

  set width(value: number) {
    this._width = value
    super.width = value

    if (this.graphic) {
      this.graphic.width = value
    }
  }

  set height(value: number) {
    this._height = value
    super.height = value
    if (this.graphic) {
      this.graphic.height = value
    }
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

  get htmlProps() {
    if (!this.scene) return {}

    const screenPos = this.scene.engine.worldToScreenCoordinates(this.pos)

    const superProps = super.htmlProps

    return {
      ...superProps,
      style: {
        ...superProps.style,

        left: this.toCssPx(
          screenPos.x - this.localBounds.width * this.anchor.x,
        ),
        top: this.toCssPx(
          screenPos.y - this.localBounds.height * this.anchor.y,
        ),
      },
    }
  }
}
