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

export interface BaseElementProps {
  class?: string
  style?: JSX.IntrinsicElements['div']['style']
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

  constructor() {
    super()
    this.htmlElement = document.createElement('div')
    this.htmlElement.style.visibility = 'hidden'
    this.style = {}
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

  get style(): CSSStyleDeclaration {
    return this.htmlElement.style
  }

  set style(value: JSX.IntrinsicElements['div']['style']) {
    Object.assign(this.htmlElement.style, value)
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

  applyNativeStyle(
    // @ts-ignore
    styles: CSSStyleDeclaration,
  ) {
    const rect = this.getLocalBoundingClientRect()

    const transform = this.transform

    transform.pos = new Vector(rect.left, rect.top)
    this._styleDirty = false
  }

  onPostUpdate(engine: Engine): void {
    if (this.htmlElement) {
      if (this._styleDirty) {
        this.applyNativeStyle(this.htmlElement.style)
        this.children.forEach((child) => {
          if (child instanceof BaseElement) {
            child.applyNativeStyle(child.htmlElement.style)
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
