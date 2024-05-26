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

export interface GraphicProps extends Omit<ViewProps, 'ref'> {
  ref?: (el: GraphicElement) => void
  graphic: ex.Graphic
}

export class GraphicElement extends ViewElement {
  private _graphics!: GraphicsComponent

  private _width = 0
  private _height = 0

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
      if (this._width) {
        value.width = this._width
      }

      if (this._height) {
        value.height = this._height
      }
      this.localBounds = new BoundingBox(0, 0, value.width, value.height)
    } else {
      this.localBounds = new BoundingBox(0, 0, 0, 0)
    }
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

  htmlProps() {
    if (!this.scene) return {}

    const screenPos = this.scene.engine.worldToScreenCoordinates(this.pos)

    const superProps = super.htmlProps()
    return {
      ...superProps,
      style: {
        ...superProps.style,
        left: this.toCssPx(screenPos.x - this.width * this.anchor.x),
        top: this.toCssPx(screenPos.y - this.height * this.anchor.y),
      },
    }
  }
}
