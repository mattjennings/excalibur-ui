import { createExElement } from '.'
import { UIElement, UIElementProps } from '../ui-element'
import { Rectangle, Color } from 'excalibur'

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

export interface RectangleProps extends UIElementProps {
  color?: ex.Color | string
}

export class RectangleElement extends UIElement {
  constructor() {
    super()
    this.graphics.add(
      new Rectangle({
        width: 1,
        height: 1,
        color: Color.Black,
      }),
    )
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
