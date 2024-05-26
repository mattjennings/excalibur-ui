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

export interface RectangleProps extends GraphicProps {
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

  private get _currentGraphic() {
    return this.graphics.current as ex.Rectangle
  }

  get color(): ex.Color | undefined {
    return this._currentGraphic?.color
  }

  set color(value: RectangleProps['color']) {
    if (value) {
      this._currentGraphic.color =
        typeof value === 'string' ? Color.fromHex(value as string) : value
    }
  }
}
