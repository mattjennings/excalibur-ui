import { createExElement } from '.'

import { Rectangle } from 'excalibur'
import { RasterElement, RasterProps } from './raster'

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

export interface RectangleProps<T extends RectangleElement = RectangleElement>
  extends Omit<RasterProps<T>, 'graphic'> {
  borderRadius?:
    | number
    | {
        topLeft?: number
        topRight?: number
        bottomLeft?: number
        bottomRight?: number
      }
}

export class RectangleElement extends RasterElement {
  constructor() {
    super()
    this.graphic = new RoundableRectangle({
      width: 0,
      height: 0,
    })
  }

  get graphic(): RoundableRectangle {
    return super.graphic as RoundableRectangle
  }

  set graphic(value: RoundableRectangle) {
    super.graphic = value
  }

  get borderRadius(): RectangleProps['borderRadius'] {
    return this.graphic.borderRadius
  }

  set borderRadius(value: RectangleProps['borderRadius']) {
    if (value) {
      if (typeof value === 'number') {
        this.graphic.borderRadius = {
          topLeft: value,
          topRight: value,
          bottomLeft: value,
          bottomRight: value,
        }
      } else {
        this.graphic.borderRadius = {
          topLeft: value.topLeft ?? 0,
          topRight: value.topRight ?? 0,
          bottomLeft: value.bottomLeft ?? 0,
          bottomRight: value.bottomRight ?? 0,
        }
      }
    }
  }
}

export class RoundableRectangle extends Rectangle {
  borderRadius?: {
    topLeft: number
    topRight: number
    bottomLeft: number
    bottomRight: number
  }

  execute(ctx: CanvasRenderingContext2D) {
    const radii = [
      this.borderRadius?.topLeft ?? 0,
      this.borderRadius?.topRight ?? 0,
      this.borderRadius?.bottomRight ?? 0,
      this.borderRadius?.bottomLeft ?? 0,
    ]

    if (this.borderRadius) {
      // using roundRect with radii doubles the line width...
      // so to keep things consistent with/without border radius
      // we need to correct for that
      ctx.lineWidth = this.lineWidth / 2

      ctx.roundRect(
        ctx.lineWidth,
        ctx.lineWidth,
        this.width - ctx.lineWidth * 2,
        this.height - ctx.lineWidth * 2,
        radii,
      )
    } else {
      ctx.roundRect(0, 0, this.width, this.height)
    }

    if (this.color) {
      ctx.fill()
    }

    if (this.strokeColor) {
      ctx.stroke()
    }
  }
}
