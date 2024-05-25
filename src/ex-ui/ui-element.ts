import { Accessor, createSignal } from 'solid-js'
import { UIContainer } from './ui-container'

export interface UIElementProps {
  pos?: ex.Vector
  x?: number
  y?: number
  z?: number
  width?: number
  height?: number
  anchor?: ex.Vector
  opacity?: number
  scale?: ex.Vector
  rotation?: number
  pointer?: {
    useGraphicsBounds?: boolean
    useColliderShape?: boolean
  }
  html?: (props: Accessor<Record<string, any>>) => HTMLElement

  draggable?: boolean

  onPreUpdate?: (ev: ex.PreUpdateEvent) => void
  onPostUpdate?: (ev: ex.PostUpdateEvent) => void
  onKill?: (ev: ex.KillEvent) => void
  onPreKill?: (ev: ex.PreKillEvent) => void
  onPostKill?: (ev: ex.PostKillEvent) => void
  onPreDraw?: (ev: ex.PreDrawEvent) => void
  onPostDraw?: (ev: ex.PostDrawEvent) => void
  onPreTransformDraw?: (ev: ex.PreTransformDrawEvent) => void
  onPostTransformDraw?: (ev: ex.PostTransformDrawEvent) => void
  onPreDebugDraw?: (ev: ex.PreDebugDrawEvent) => void
  onPostDebugDraw?: (ev: ex.PostDebugDrawEvent) => void
  onPointerUp?: (ev: ex.PointerEvent) => void
  onPointerDown?: (ev: ex.PointerEvent) => void
  onPointerEnter?: (ev: ex.PointerEvent) => void
  onPointerLeave?: (ev: ex.PointerEvent) => void
  onPointerMove?: (ev: ex.PointerEvent) => void
  onPointerCancel?: (ev: ex.PointerEvent) => void
  onWheel?: (ev: ex.WheelEvent) => void
  onPointerDrag?: (ev: ex.PointerEvent) => void
  onPointerDragEnd?: (ev: ex.PointerEvent) => void
  onPointerDragEnter?: (ev: ex.PointerEvent) => void
  onPointerDragLeave?: (ev: ex.PointerEvent) => void
  onPointerDragMove?: (ev: ex.PointerEvent) => void
}

/**
 * Base class for all UI elements.
 */
export class UIElement extends ex.Entity {
  _transform!: ex.TransformComponent
  _graphics!: ex.GraphicsComponent
  _pointer!: ex.PointerComponent

  declare events: ex.EventEmitter

  uiContainer?: UIContainer

  constructor() {
    super()
    this._transform = new ex.TransformComponent()
    this._graphics = new ex.GraphicsComponent()
    this._pointer = new ex.PointerComponent()
    this.graphics.anchor = ex.Vector.Zero
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

  get pointer(): ex.PointerComponent {
    return this._pointer
  }

  get width() {
    return this.graphics.current?.width ?? 0
  }

  set width(value: number) {
    if (!this.graphics.current) return
    this.graphics.current.width = value
    this.pointer.localBounds = new ex.BoundingBox(0, 0, value, this.height)
  }

  get height() {
    return this.graphics.current?.height ?? 0
  }

  set height(value: number) {
    if (!this.graphics.current) return
    this.graphics.current.height = value
    this.pointer.localBounds = new ex.BoundingBox(0, 0, this.width, value)
  }

  get anchor() {
    return this.graphics.anchor
  }

  set anchor(value: ex.Vector) {
    this.graphics.anchor = value
  }

  get pos() {
    return this.transform.pos
  }

  set pos(value: ex.Vector) {
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

  set scale(value: ex.Vector) {
    this.transform.scale = value
  }

  get rotation() {
    return this.transform.rotation
  }

  set rotation(value: number) {
    this.transform.rotation = value
  }

  set pointer(value: UIElementProps['pointer']) {
    const pointer = this.get(ex.PointerComponent)
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

  private _pointerDragMoveHandler = (pe: ex.PointerEvent) => {
    if (this._dragging) {
      this.pos = pe.worldPos
    }
  }

  private _pointerDragLeaveHandler = (pe: ex.PointerEvent) => {
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
  private _htmlPropsSignal = createSignal({})

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

export type UIElementEvents = ex.EntityEvents & {
  kill: ex.KillEvent
  prekill: ex.PreKillEvent
  postkill: ex.PostKillEvent
  predraw: ex.PreDrawEvent
  postdraw: ex.PostDrawEvent
  pretransformdraw: ex.PreDrawEvent
  posttransformdraw: ex.PostDrawEvent
  predebugdraw: ex.PreDebugDrawEvent
  postdebugdraw: ex.PostDebugDrawEvent
  pointerup: ex.PointerEvent
  pointerdown: ex.PointerEvent
  pointerenter: ex.PointerEvent
  pointerleave: ex.PointerEvent
  pointermove: ex.PointerEvent
  pointercancel: ex.PointerEvent
  pointerwheel: ex.WheelEvent
  pointerdragstart: ex.PointerEvent
  pointerdragend: ex.PointerEvent
  pointerdragenter: ex.PointerEvent
  pointerdragleave: ex.PointerEvent
  pointerdragmove: ex.PointerEvent
}
