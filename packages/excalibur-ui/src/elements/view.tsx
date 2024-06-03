import { createExElement } from '.'

import {
  BoundingBox,
  EntityEvents,
  EventEmitter,
  KillEvent,
  PointerComponent,
  PointerEvent,
  PostDebugDrawEvent,
  PostDrawEvent,
  PostKillEvent,
  PostTransformDrawEvent,
  PostUpdateEvent,
  PreDebugDrawEvent,
  PreDrawEvent,
  PreKillEvent,
  PreTransformDrawEvent,
  PreUpdateEvent,
  Vector,
} from 'excalibur'
import { JSXElement } from 'solid-js'
import { BaseElement, BaseElementProps } from '../base-element'

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

export interface ViewProps<T extends ViewElement = ViewElement>
  extends BaseElementProps {
  ref?: (el: T) => void
  pos?: Vector
  children?: JSXElement
  anchor?: Vector
  opacity?: number
  scale?: Vector
  rotation?: number

  /**
   * If true, the element will use the bounds of its children to calculate its own bounds.
   */
  useChildBounds?: boolean

  /**
   * Intended for accessibility, render an HTML element representing this view.
   *
   * Props are provided to position this element according to the view's position on the canvas.
   *
   * example: `html={(props) => <span style={props.style}>Label</span>}`
   */
  html?: (
    props: Record<string, any> & {
      style: Record<string, string>
    },
  ) => HTMLElement

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
export class ViewElement extends BaseElement {
  private _pointer!: PointerComponent
  private _localBounds: BoundingBox = new BoundingBox(0, 0, 0, 0)
  declare events: EventEmitter

  constructor() {
    super()
    this._pointer = new PointerComponent()

    this.addComponent(this._pointer)
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

  get height() {
    return this.localBounds.height
  }

  get pos() {
    return this.transform.pos
  }

  get globalPos() {
    return this.transform.globalPos
  }

  get x() {
    return this.transform.pos.x
  }

  get y() {
    return this.transform.pos.y
  }

  get z() {
    return this.transform.z
  }

  get scale() {
    return this.transform.scale
  }

  get rotation() {
    return this.transform.rotation
  }

  syncLayout(): void {
    super.syncLayout()

    this.localBounds = new BoundingBox(
      0,
      0,
      this.clientRect.width,
      this.clientRect.height,
    )
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
