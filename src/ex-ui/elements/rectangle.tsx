import { createElement } from '.'
import { UIElement, UIElementProps } from '../ui-element'

export default createElement({
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

class RectangleElement extends UIElement {
  constructor() {
    super()
    this.graphics.add(
      new ex.Rectangle({
        width: 1,
        height: 1,
        color: ex.Color.Black,
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
        typeof value === 'string' ? ex.Color.fromHex(value as string) : value
    }
  }
}

declare global {
  namespace JSX {
    interface IntrinsicElements {
      rectangle: RectangleProps
    }
  }
}
