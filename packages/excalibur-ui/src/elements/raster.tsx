import { Color } from 'excalibur'
import { GraphicElement, GraphicProps } from './graphic'

export interface RasterProps<T extends RasterElement = RasterElement>
  extends GraphicProps<T> {
  color?: ex.Raster['color'] | string
  strokeColor?: ex.Raster['strokeColor']
  lineCap?: ex.Raster['lineCap']
  lineDash?: ex.Raster['lineDash']
  lineWidth?: ex.Raster['lineWidth']
  padding?: ex.Raster['padding']
}

export abstract class RasterElement extends GraphicElement {
  get graphic() {
    return this.graphics.current as ex.Rectangle
  }

  set graphic(value: ex.Rectangle) {
    super.graphic = value
  }

  get color(): ex.Color | undefined {
    return this.graphic.color
  }

  set color(value: RasterProps['color']) {
    if (value) {
      this.graphic.color =
        typeof value === 'string' ? Color.fromHex(value as string) : value
    }
  }

  get strokeColor(): ex.Color | undefined {
    return this.graphic.strokeColor
  }

  set strokeColor(value: RasterProps['strokeColor']) {
    if (value) {
      this.graphic.strokeColor =
        typeof value === 'string' ? Color.fromHex(value as string) : value
    }
  }

  get lineCap(): ex.Raster['lineCap'] {
    return this.graphic.lineCap
  }

  set lineCap(value: RasterProps['lineCap']) {
    if (value) {
      this.graphic.lineCap = value
    }
  }

  get lineDash(): ex.Raster['lineDash'] {
    return this.graphic.lineDash
  }

  set lineDash(value: RasterProps['lineDash']) {
    if (value) {
      this.graphic.lineDash = value
    }
  }

  get lineWidth(): ex.Raster['lineWidth'] {
    return this.graphic.lineWidth
  }

  set lineWidth(value: RasterProps['lineWidth']) {
    if (typeof value === 'number') {
      this.graphic.lineWidth = value
    }
  }

  get padding(): number {
    return this.graphic.padding
  }

  set padding(value: RasterProps['padding']) {
    if (typeof value === 'number') {
      this.graphic.padding = value
    }
  }
}
