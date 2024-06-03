import {
  Color,
  Engine,
  Entity,
  EntityEvents,
  GraphicsComponent,
  KillEvent,
  PostKillEvent,
  PreKillEvent,
  Scene,
  TransformComponent,
  Vector,
} from 'excalibur'
import { HTMLContainer } from './html-container'
import * as csstype from 'csstype'

export type LayoutProperties = Pick<
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
  | 'margin'
  | 'order'
  | 'padding'
  | 'placeContent'
  | 'placeItems'
  | 'placeSelf'
  | 'position'
  | 'top'
  | 'width'
  | 'zIndex'
>

export interface BaseElementProps {
  layout?: LayoutProperties
}

/**
 * Base class for all UI elements.
 */
export class BaseElement extends Entity {
  private _transform!: TransformComponent

  htmlElement!: HTMLElement
  htmlContainer!: HTMLContainer

  protected _styleDirty = true
  protected _styleMutationObserver: MutationObserver | null = null
  protected _layout!: LayoutProperties

  constructor() {
    super()
    this.htmlElement = document.createElement('div')

    this.layout = {}
    this._transform = new TransformComponent()
    this.addComponent(this._transform)
    this._styleMutationObserver = new MutationObserver(() => {
      this._styleDirty = true
    })

    this._styleMutationObserver.observe(this.htmlElement, {
      attributes: true,
      attributeFilter: ['style', 'class'],
    })
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
  }

  addChild(entity: BaseElement): Entity<any> {
    super.addChild(entity)
    return entity
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
    const rect = this.getLocalBoundingClientRect()
    const transform = this.transform

    transform.pos = new Vector(rect.left, rect.top)
    this._styleDirty = false
  }

  onPostUpdate(engine: Engine): void {
    if (this.htmlElement) {
      if (this._styleDirty) {
        this.syncLayout()
        this.children.forEach((child) => {
          if (child instanceof BaseElement) {
            child.syncLayout()
          }
        })
        this._styleDirty = false
      }
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

  getBoundingClientRect() {
    const rect = this.htmlElement.getBoundingClientRect()

    const scale = this.htmlContainer.scale
    return {
      left: rect.x / scale.x,
      top: rect.y / scale.y,
      width: rect.width / scale.x,
      height: rect.height / scale.y,
    }
  }

  getLocalBoundingClientRect() {
    if (this.parent instanceof BaseElement) {
      const rect = this.getBoundingClientRect()
      const parentRect = this.parent.getBoundingClientRect()

      return {
        left: rect.left - parentRect.left,
        top: rect.top - parentRect.top,
        width: rect.width,
        height: rect.height,
      }
    }

    return this.getBoundingClientRect()
  }
}

export type BaseElementEvents = EntityEvents & {
  kill: KillEvent
  prekill: PreKillEvent
  postkill: PostKillEvent
}
