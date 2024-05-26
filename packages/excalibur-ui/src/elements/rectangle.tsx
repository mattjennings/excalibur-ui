import { createExElement } from '.'

import { Color, Rectangle } from 'excalibur'
import { GraphicElement, GraphicProps } from './graphic'

export default createExElement({
  init() {
    return new RectangleElement()
  },
  applyProp(instance, prop, value) {
    switch (prop) {
      default:
        // @ts-ignore
        instance[prop] = value
    }
  },
})

export interface RectangleProps extends Omit<GraphicProps, 'graphic' | 'ref'> {
  ref?: (el: RectangleElement) => void
  color?: ex.Color | string
}

export class RectangleElement extends GraphicElement {
  constructor() {
    super()
    this.graphic = new Rectangle({
      width: 1,
      height: 1,
      color: Color.Black,
    })
  }

  get graphic() {
    return this.graphics.current as ex.Rectangle
  }

  set graphic(value: ex.Rectangle) {
    super.graphic = value
    console.log(this.localBounds)
  }

  get color(): ex.Color | undefined {
    return this.graphic.color
  }

  set color(value: RectangleProps['color']) {
    if (value) {
      this.graphic.color =
        typeof value === 'string' ? Color.fromHex(value as string) : value
    }
  }
}
