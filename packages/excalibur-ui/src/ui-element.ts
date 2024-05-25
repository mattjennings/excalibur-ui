import { Accessor, createSignal } from 'solid-js'
import { UIContainer } from './ui-container'
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
  GraphicsComponent,
  PointerComponent,
  EventEmitter,
  BoundingBox,
  EntityEvents,
  PointerEvent,
} from 'excalibur'

export interface UIElementProps {
  ref?: (el: UIElement) => void
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
  pointer?: {
    useGraphicsBounds?: boolean
    useColliderShape?: boolean
  }
  html?: (props: Accessor<Record<string, any>>) => HTMLElement

  draggable?: boolean

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
export class UIElement extends Entity {
  _transform!: TransformComponent
  _graphics!: GraphicsComponent
  _pointer!: PointerComponent

  declare events: EventEmitter

  uiContainer?: UIContainer

  constructor() {
    super()
    this._transform = new TransformComponent()
    this._graphics = new GraphicsComponent()
    this._pointer = new PointerComponent()
    this.graphics.anchor = Vector.Zero
    this.addComponent(this.transform)
    this.addComponent(this.graphics)
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

  get graphics() {
    return this._graphics
  }

  get pointer(): PointerComponent {
    return this._pointer
  }

  get width() {
    return this.graphics.current?.width ?? 0
  }

  set width(value: number) {
    if (!this.graphics.current) return
    this.graphics.current.width = value
    this.pointer.localBounds = new BoundingBox(0, 0, value, this.height)
  }

  get height() {
    return this.graphics.current?.height ?? 0
  }

  set height(value: number) {
    if (!this.graphics.current) return
    this.graphics.current.height = value
    this.pointer.localBounds = new BoundingBox(0, 0, this.width, value)
  }

  get anchor() {
    return this.graphics.anchor
  }

  set anchor(value: Vector) {
    this.graphics.anchor = value
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

  get opacity() {
    return this.graphics.current?.opacity ?? 1
  }

  set opacity(value: number) {
    if (!this.graphics.current) return
    this.graphics.current.opacity = value
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

  set pointer(value: UIElementProps['pointer']) {
    const pointer = this.get(PointerComponent)
    pointer.useGraphicsBounds =
      value?.useGraphicsBounds ?? pointer.useGraphicsBounds
    pointer.useColliderShape =
      value?.useColliderShape ?? pointer.useColliderShape
  }

  /**
   * Draggable helper
   */
  private _draggable: boolean = false
  private _dragging: boolean = false

  private _pointerDragStartHandler = () => {
    this._dragging = true
  }

  private _pointerDragEndHandler = () => {
    this._dragging = false
  }

  private _pointerDragMoveHandler = (pe: PointerEvent) => {
    if (this._dragging) {
      this.pos = pe.worldPos
    }
  }

  private _pointerDragLeaveHandler = (pe: PointerEvent) => {
    if (this._dragging) {
      this.pos = pe.worldPos
    }
  }

  public get draggable(): boolean {
    return this._draggable
  }

  public set draggable(isDraggable: boolean) {
    if (isDraggable) {
      if (isDraggable && !this._draggable) {
        this.events.on('pointerdragstart', this._pointerDragStartHandler)
        this.events.on('pointerdragend', this._pointerDragEndHandler)
        this.events.on('pointerdragmove', this._pointerDragMoveHandler)
        this.events.on('pointerdragleave', this._pointerDragLeaveHandler)
      } else if (!isDraggable && this._draggable) {
        this.events.off('pointerdragstart', this._pointerDragStartHandler)
        this.events.off('pointerdragend', this._pointerDragEndHandler)
        this.events.off('pointerdragmove', this._pointerDragMoveHandler)
        this.events.off('pointerdragleave', this._pointerDragLeaveHandler)
      }

      this._draggable = isDraggable
    }
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
        // visibility: 'hidden',
        position: 'absolute',
        left: this.toCssPx(screenPos.x - this.width * this.anchor.x),
        top: this.toCssPx(screenPos.y - this.height * this.anchor.y),
        width: this.toCssPx(this.width),
        height: this.toCssPx(this.height),
      },
    }
  }
}

export type UIElementEvents = EntityEvents & {
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
