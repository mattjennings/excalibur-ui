import * as csstype from 'csstype'
import {
  Engine,
  Entity,
  EntityEvents,
  KillEvent,
  PostKillEvent,
  PreKillEvent,
  Scene,
  TransformComponent,
  Vector,
} from 'excalibur'
import { HTMLContainer } from './html-container'

export interface LayoutProperties
  extends Pick<
    csstype.Properties,
    | 'alignItems'
    | 'alignSelf'
    | 'display'
    | 'flexBasis'
    | 'flexDirection'
    | 'flexGrow'
    | 'flexShrink'
    | 'flexWrap'
    | 'gap'
    | 'grid'
    | 'gridArea'
    | 'gridAutoColumns'
    | 'gridAutoFlow'
    | 'gridAutoRows'
    | 'gridColumn'
    | 'gridColumnGap'
    | 'gridGap'
    | 'gridRow'
    | 'gridRowGap'
    | 'gridTemplate'
    | 'gridTemplateAreas'
    | 'gridTemplateColumns'
    | 'gridTemplateRows'
    | 'height'
    | 'justifyContent'
    | 'justifyItems'
    | 'justifySelf'
    | 'left'
    | 'right'
    | 'bottom'
    | 'margin'
    | 'marginBottom'
    | 'marginLeft'
    | 'marginRight'
    | 'marginTop'
    | 'maxHeight'
    | 'maxWidth'
    | 'order'
    | 'padding'
    | 'paddingBottom'
    | 'paddingLeft'
    | 'paddingRight'
    | 'paddingTop'
    | 'placeContent'
    | 'placeItems'
    | 'placeSelf'
    | 'position'
    | 'top'
    | 'width'
    | 'zIndex'
    | 'transition'
    | 'transitionProperty'
    | 'transitionDuration'
    | 'transitionTimingFunction'
    | 'transitionDelay'
    | 'transform'
    | 'transformOrigin'
    | 'transformStyle'
    | 'perspective'
    | 'perspectiveOrigin'
    | 'backfaceVisibility'
    | 'rotate'
    | 'scale'
  > {}

export interface BaseElementProps {
  layout?: LayoutProperties
}

/**
 * Base class for all UI elements.
 */
export class BaseElement extends Entity {
  private _transform!: TransformComponent
  protected _layout!: LayoutProperties

  htmlElement!: HTMLElement
  htmlContainer!: HTMLContainer

  clientRect!: Rect
  localClientRect!: Rect

  constructor() {
    super()
    this.htmlElement = document.createElement('div')
    this.layout = {}
    this._transform = new TransformComponent()
    this.addComponent(this._transform)
  }

  get transform() {
    return this._transform
  }

  get layout(): LayoutProperties {
    return this._layout
  }

  set layout(value: BaseElementProps['layout']) {
    this._layout = value || {}
    Object.assign(this.htmlElement.style, this._layout)
  }

  onInitialize(engine: Engine) {
    this.htmlContainer = this.getHTMLContainer(engine.currentScene)

    if (this.parent instanceof BaseElement) {
      this.parent.htmlElement.appendChild(this.htmlElement)
    } else {
      this.htmlContainer.htmlElement.appendChild(this.htmlElement)
    }
    this.syncLayout()
  }

  kill() {
    this.events.emit('prekill')
    this.onPreKill?.()

    if (this.htmlElement) {
      this.htmlElement.remove()
    }

    for (const child of [...this.children]) {
      child.kill()
    }

    super.kill()
    this.events.emit('postkill')
    this.onPostKill?.()
  }

  onPreKill() {}
  onPostKill() {}

  syncLayout() {
    this.clientRect = this.getScaledBoundingClientRect()
    this.localClientRect = this.getLocalScaledBoundingClientRect()

    const rect = this.localClientRect
    const transform = this.transform

    transform.pos = new Vector(rect.left, rect.top)

    if (typeof this.layout.zIndex !== 'undefined') {
      transform.z =
        typeof this.layout.zIndex === 'string'
          ? parseInt(this.layout.zIndex)
          : this.layout.zIndex
    }

    if (typeof this.layout.rotate !== 'undefined') {
      if (typeof this.layout.rotate === 'string') {
        if (this.layout.rotate.endsWith('rad')) {
          transform.rotation = parseFloat(this.layout.rotate) * (Math.PI / 180)
        } else if (this.layout.rotate.endsWith('deg')) {
          transform.rotation = parseFloat(this.layout.rotate)
        } else if (this.layout.rotate.endsWith('turn')) {
          transform.rotation = parseFloat(this.layout.rotate) * 360
        } else {
          transform.rotation = parseFloat(this.layout.rotate)
        }
      } else {
        transform.rotation = this.layout.rotate
      }
    }

    if (typeof this.layout.scale !== 'undefined') {
      if (typeof this.layout.scale === 'string') {
        const vector = new Vector(1, 1)

        const [x, y] = this.layout.scale.split(' ')
        if (x) {
          if (x.endsWith('%')) {
            vector.x = parseFloat(x) / 100
          } else {
            vector.x = parseFloat(x)
          }
        }
        if (y) {
          if (y.endsWith('%')) {
            vector.y = parseFloat(y) / 100
          } else {
            vector.y = parseFloat(y)
          }
        }

        transform.scale = vector
      } else {
        transform.scale = new Vector(this.layout.scale, this.layout.scale)
      }
    }
  }

  reflow() {
    if (this.htmlElement && this.htmlContainer) {
      this.syncLayout()

      for (const child of this.children) {
        if (child instanceof BaseElement) {
          child.reflow()
        }
      }
    }
  }

  getScaledBoundingClientRect() {
    const clientRect = this.htmlElement.getBoundingClientRect()
    const scale = this.htmlContainer.scale

    return {
      top: clientRect.top / scale.y,
      left: clientRect.left / scale.x,
      width: clientRect.width / scale.x,
      height: clientRect.height / scale.y,
    }
  }

  getLocalScaledBoundingClientRect() {
    if (this.parent instanceof BaseElement) {
      const parentClientRect = this.parent.clientRect

      return {
        top: this.clientRect.top - parentClientRect.top,
        left: this.clientRect.left - parentClientRect.left,
        width: this.clientRect.width,
        height: this.clientRect.height,
      }
    } else {
      return this.getScaledBoundingClientRect()
    }
  }

  getHTMLContainer(scene: Scene & { __exui_html_container?: HTMLContainer }) {
    if (!scene.__exui_html_container) {
      scene.__exui_html_container = new HTMLContainer()
      scene.add(scene.__exui_html_container)

      scene.__exui_html_container.on('kill', () => {
        delete scene.__exui_html_container
      })
    }

    return scene.__exui_html_container
  }
}

export type BaseElementEvents = EntityEvents & {
  kill: KillEvent
  prekill: PreKillEvent
  postkill: PostKillEvent
}

interface Rect {
  top: number
  left: number
  width: number
  height: number
}
