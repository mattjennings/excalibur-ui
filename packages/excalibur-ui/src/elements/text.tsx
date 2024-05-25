import { createElement } from '.'
import { UIElement, UIElementProps } from '../ui-element'
import {
  Color,
  SpriteFont,
  FontOptions,
  GraphicOptions,
  RasterOptions,
  Text,
  Font,
} from 'excalibur'

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
  color?: Color | string
  font?: Font | SpriteFont | (FontOptions & GraphicOptions & RasterOptions)
  width?: never
  height?: never
}

export class TextElement extends UIElement {
  constructor() {
    super()
    this.graphics.add(
      new Text({
        text: '',
        color: Color.Black,
      }),
    )
  }

  private get _currentGraphic() {
    return this.graphics.current as Text
  }

  get color(): Color | undefined {
    return this._currentGraphic?.color
  }

  set color(value: TextProps['color']) {
    if (value) {
      this._currentGraphic.color =
        typeof value === 'string' ? Color.fromHex(value as string) : value
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
    if (value instanceof Font || value instanceof SpriteFont) {
      this._currentGraphic.font = value
    } else {
      this._currentGraphic.font = new Font(value)
    }
  }
}
