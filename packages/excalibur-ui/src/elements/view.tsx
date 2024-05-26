import { createExElement } from '.'

import { Accessor, createSignal } from 'solid-js'

import {
  Vector,
  PreUpdateEvent,
  PostUpdateEvent,
  KillEvent,
  PreKillEvent,
  PostKillEvent,
  PreDrawEvent,
  PostDrawEvent,
  PreTransformDrawEvent,
  PostTransformDrawEvent,
  PreDebugDrawEvent,
  PostDebugDrawEvent,
  Entity,
  TransformComponent,
  PointerComponent,
  EventEmitter,
  BoundingBox,
  EntityEvents,
  PointerEvent,
} from 'excalibur'
import { UIContainer } from '../ui-container'

export default createExElement({
  init() {
    return new ViewElement()
  },
  applyProp(instance, prop, value) {
    switch (prop) {
      default:
        // @ts-ignore
        instance[prop] = value
    }
  },
})

export interface ViewProps {
  ref?: (el: ViewElement) => void
  pos?: Vector
  x?: number
  y?: number
  z?: number

  width?: number
  height?: number

  anchor?: Vector
  opacity?: number
  scale?: Vector
  rotation?: number

  /**
   * If true, the element will use the bounds of its children to calculate its own bounds.
   */
  useChildBounds?: boolean

  html?: (props: Accessor<Record<string, any>>) => HTMLElement

  onPreUpdate?: (ev: PreUpdateEvent) => void
  onPostUpdate?: (ev: PostUpdateEvent) => void
  onKill?: (ev: KillEvent) => void
  onPreKill?: (ev: PreKillEvent) => void
  onPostKill?: (ev: PostKillEvent) => void
  onPreDraw?: (ev: PreDrawEvent) => void
  onPostDraw?: (ev: PostDrawEvent) => void
  onPreTransformDraw?: (ev: PreTransformDrawEvent) => void
  onPostTransformDraw?: (ev: PostTransformDrawEvent) => void
  onPreDebugDraw?: (ev: PreDebugDrawEvent) => void
  onPostDebugDraw?: (ev: PostDebugDrawEvent) => void
  onPointerUp?: (ev: PointerEvent) => void
  onPointerDown?: (ev: PointerEvent) => void
  onPointerEnter?: (ev: PointerEvent) => void
  onPointerLeave?: (ev: PointerEvent) => void
  onPointerMove?: (ev: PointerEvent) => void
  onPointerCancel?: (ev: PointerEvent) => void
  onWheel?: (ev: WheelEvent) => void
  onPointerDrag?: (ev: PointerEvent) => void
  onPointerDragEnd?: (ev: PointerEvent) => void
  onPointerDragEnter?: (ev: PointerEvent) => void
  onPointerDragLeave?: (ev: PointerEvent) => void
  onPointerDragMove?: (ev: PointerEvent) => void
}

/**
 * Base class for all UI elements.
 */
export class ViewElement extends Entity {
  private _transform!: TransformComponent
  private _pointer!: PointerComponent

  private _localBounds: BoundingBox = new BoundingBox(0, 0, 0, 0)

  declare events: EventEmitter

  uiContainer?: UIContainer

  constructor() {
    super()
    this._transform = new TransformComponent()
    this._pointer = new PointerComponent()

    this.addComponent(this._transform)
    this.addComponent(this._pointer)

    this.on('predraw', () => {
      if (this.isInitialized) {
        this._updateHtml()
      }
    })

    this.on('initialize', () => {
      let parent = this.parent
      while (parent) {
        if (parent instanceof UIContainer) {
          this.uiContainer = parent
          break
        }
        parent = parent.parent
      }
    })
  }

  kill() {
    this.events.emit('prekill')
    this.onPreKill?.()
    super.kill()
    this.events.emit('postkill')
    this.onPostKill?.()
  }

  onPreKill() {}
  onPostKill() {}

  get transform() {
    return this._transform
  }

  get pointer(): PointerComponent {
    return this._pointer
  }

  get localBounds() {
    return this._localBounds
  }

  set localBounds(value: BoundingBox) {
    this._localBounds = value
    this.pointer.localBounds = value
  }

  get width() {
    return this.localBounds.width
  }

  set width(value: number) {
    const height = this.localBounds.height
    this.localBounds = new BoundingBox(0, 0, value, height)
  }

  get height() {
    return this.localBounds.height
  }

  set height(value: number) {
    const width = this.localBounds.width
    this.localBounds = new BoundingBox(0, 0, width, value)
  }

  get pos() {
    return this.transform.pos
  }

  set pos(value: Vector) {
    this.transform.pos = value
  }

  get x() {
    return this.transform.pos.x
  }

  set x(value: number) {
    this.transform.pos.x = value
  }

  get y() {
    return this.transform.pos.y
  }

  set y(value: number) {
    this.transform.pos.y = value
  }

  get z() {
    return this.transform.z
  }

  set z(value: number) {
    this.transform.z = value
  }

  get scale() {
    return this.transform.scale
  }

  set scale(value: Vector) {
    this.transform.scale = value
  }

  get rotation() {
    return this.transform.rotation
  }

  set rotation(value: number) {
    this.transform.rotation = value
  }

  private _htmlElement: HTMLElement | null = null
  private _htmlPropsSignal = createSignal(
    {},
    {
      // terrible idea, but probably still faster than
      // updating DOM element every frame
      // best solution would be to update style attributes narrowly with signals
      equals(prev, next) {
        return JSON.stringify(prev) === JSON.stringify(next)
      },
    },
  )

  set html(node: (props: any) => HTMLElement) {
    this._htmlElement = node(this._htmlPropsSignal[0])
  }

  private _updateHtml() {
    if (!this.uiContainer) return

    if (this._htmlElement && !this._htmlElement?.parentNode) {
      this.uiContainer.htmlElement.appendChild(this._htmlElement)
    }

    this._htmlPropsSignal[1](this.htmlProps())
  }

  toCssPx(value: number) {
    return `calc(${value} * var(--px))`
  }

  htmlProps() {
    if (!this.scene) return {}

    const screenPos = this.scene.engine.worldToScreenCoordinates(this.pos)

    return {
      style: {
        position: 'absolute',
        left: this.toCssPx(screenPos.x - this.width),
        top: this.toCssPx(screenPos.y - this.height),
        width: this.toCssPx(this.width),
        height: this.toCssPx(this.height),
      },
    }
  }
}

export type ViewElementEvents = EntityEvents & {
  kill: KillEvent
  prekill: PreKillEvent
  postkill: PostKillEvent
  predraw: PreDrawEvent
  postdraw: PostDrawEvent
  pretransformdraw: PreDrawEvent
  posttransformdraw: PostDrawEvent
  predebugdraw: PreDebugDrawEvent
  postdebugdraw: PostDebugDrawEvent
  pointerup: PointerEvent
  pointerdown: PointerEvent
  pointerenter: PointerEvent
  pointerleave: PointerEvent
  pointermove: PointerEvent
  pointercancel: PointerEvent
  pointerwheel: WheelEvent
  pointerdragstart: PointerEvent
  pointerdragend: PointerEvent
  pointerdragenter: PointerEvent
  pointerdragleave: PointerEvent
  pointerdragmove: PointerEvent
}
