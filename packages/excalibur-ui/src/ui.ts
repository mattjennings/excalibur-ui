import {
  Engine,
  Entity,
  GraphicsComponent,
  Scene,
  TransformComponent,
  Vector,
} from 'excalibur'
import { JSXElement } from 'solid-js'
import { render } from './runtime'
import { ViewElement } from './elements'
import { BaseElement } from './base-element'

export class UI extends BaseElement {
  private ui: () => JSXElement

  constructor(ui: () => JSXElement) {
    super()
    this.ui = ui
    this.htmlElement.setAttribute('data-ex-ui', '')
    this.addComponent(this.transform)
  }

  onInitialize(engine: Engine): void {
    super.onInitialize(engine)
    this.style = {
      position: 'absolute',
      visibility: 'visible',
      width: '100%',
      height: '100%',
    }
    render(this.ui as any, this)

    this.htmlContainer.on('resize', () => {
      this._styleDirty = true
    })
  }

  get children(): ViewElement[] {
    return super.children as ViewElement[]
  }

  applyNativeStyle(styles: CSSStyleDeclaration): void {
    if (this.parent && this.scene) {
      const transform = this.parent.get(TransformComponent)
      const graphics = this.parent.get(GraphicsComponent)

      if (transform) {
        const screenPos = this.scene.engine.worldToScreenCoordinates(
          transform.pos,
        )
        const anchor = graphics?.anchor || Vector.Zero
        const width = graphics.current?.width || 0
        const height = graphics.current?.height || 0

        this.style.left = `${screenPos.x - anchor.x * width}px`
        this.style.top = `${screenPos.y - anchor.y * height}px`
        this.style.width = `${width}px`
        this.style.height = `${height}px`
      }
    }
  }
}
