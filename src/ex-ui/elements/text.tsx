import { createElement } from '.'
import { UIElement, UIElementProps } from '../ui-element'

export default createElement({
  init() {
    return new TextElement()
  },
  applyProp(instance, prop, value) {
    switch (prop) {
      default:
        // @ts-ignore
        instance[prop] = value
    }
  },
})

export interface TextProps extends UIElementProps {
  text?: string
  color?: ex.Color | string
  font?:
    | ex.Font
    | ex.SpriteFont
    | (ex.FontOptions & ex.GraphicOptions & ex.RasterOptions)
}

class TextElement extends UIElement {
  constructor() {
    super()
    this.graphics.add(
      new ex.Text({
        text: '',
        color: ex.Color.Black,
      }),
    )
  }

  private get _currentGraphic() {
    return this.graphics.current as ex.Text
  }

  get color(): ex.Color | undefined {
    return this._currentGraphic?.color
  }

  set color(value: TextProps['color']) {
    if (value) {
      this._currentGraphic.color =
        typeof value === 'string' ? ex.Color.fromHex(value as string) : value
    }
  }

  get text(): string {
    return this._currentGraphic.text
  }

  set text(value: TextProps['text']) {
    this._currentGraphic.text = value ?? ''
  }

  get font() {
    return this._currentGraphic.font
  }

  set font(value: TextProps['font']) {
    if (value instanceof ex.Font || value instanceof ex.SpriteFont) {
      this._currentGraphic.font = value
    } else {
      this._currentGraphic.font = new ex.Font(value)
    }
  }
}

declare global {
  namespace JSX {
    interface IntrinsicElements {
      text: TextProps
    }
  }
}
