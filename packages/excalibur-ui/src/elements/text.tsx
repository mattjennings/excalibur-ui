import { createExElement } from '.'
import { GraphicElement, GraphicProps } from './graphic'

import {
  Color,
  SpriteFont,
  FontOptions,
  GraphicOptions,
  RasterOptions,
  Text,
  Font,
} from 'excalibur'

export default createExElement({
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

export interface TextProps extends Omit<GraphicProps, 'graphic' | 'ref'> {
  ref?: (el: TextElement) => void
  text?: string
  color?: Color | string
  font?: Font | SpriteFont | (FontOptions & GraphicOptions & RasterOptions)
  width?: never
  height?: never
}

export class TextElement extends GraphicElement {
  constructor() {
    super()
    this.graphic = new Text({
      text: '',
      color: Color.Black,
    })
  }

  get graphic(): Text {
    return super.graphic as Text
  }

  set graphic(value: Text) {
    super.graphic = value
  }

  get color(): Color | undefined {
    return this.graphic?.color
  }

  set color(value: TextProps['color']) {
    if (value) {
      this.graphic.color =
        typeof value === 'string' ? Color.fromHex(value as string) : value
    }
  }

  get text(): string {
    return this.graphic.text
  }

  set text(value: TextProps['text']) {
    this.graphic.text = value ?? ''
  }

  get font() {
    return this.graphic.font
  }

  set font(value: TextProps['font']) {
    if (value instanceof Font || value instanceof SpriteFont) {
      this.graphic.font = value
    } else {
      this.graphic.font = new Font(value)
    }
  }
}
