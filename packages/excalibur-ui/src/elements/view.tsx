import { createExElement } from '.'
import Yoga, {
  Display,
  FlexDirection,
  PositionType,
  Node,
  Align,
  Wrap,
  Justify,
} from 'yoga-layout'
import {
  BoundingBox,
  Entity,
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
  TransformComponent,
  Vector,
} from 'excalibur'
import { UIContainer } from '../ui-container'
import { createStore } from 'solid-js/store'
import { JSXElement } from 'solid-js'

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

export interface StyleProps {
  position?: PositionType
  flex?: Display
  flexDirection?: FlexDirection
  flexWrap?: Wrap
  alignItems?: Align
  justifyContent?: Justify
  gap?: number
  width?: number
  height?: number
}

export interface ViewProps<T extends ViewElement = ViewElement> {
  ref?: (el: T) => void
  pos?: Vector
  x?: number
  y?: number
  z?: number

  children?: JSXElement

  width?: number
  height?: number

  anchor?: Vector
  opacity?: number
  scale?: Vector
  rotation?: number

  style?: StyleProps
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
export class ViewElement extends Entity {
  private _transform!: TransformComponent
  private _pointer!: PointerComponent

  private _localBounds: BoundingBox = new BoundingBox(0, 0, 0, 0)

  declare events: EventEmitter

  private _uiContainer?: UIContainer

  private _htmlElement: HTMLElement | null = null
  private _htmlProps: Record<string, any>
  private _setHtmlProps: (props: Record<string, any>) => void

  yogaNode: Node

  constructor() {
    super()
    this._transform = new TransformComponent()
    this._pointer = new PointerComponent()

    this.addComponent(this._transform)
    this.addComponent(this._pointer)

    const [htmlProps, setHtmlProps] = createStore<Record<string, any>>({
      style: {
        position: 'absolute',
        left: '0',
        top: '0',
        width: '0',
        height: '0',
      },
    })

    this._htmlProps = htmlProps
    this._setHtmlProps = setHtmlProps

    this.yogaNode = Yoga.Node.create()

    this.on('predraw', () => {
      if (this.isInitialized && this._htmlElement) {
        this._setHtmlProps(this.htmlProps)
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

    this._htmlElement?.remove()
    this.yogaNode.free()

    for (const child of [...this.children]) {
      child.kill()
    }

    super.kill()
    this.events.emit('postkill')
    this.onPostKill?.()
  }

  onPreKill() {}
  onPostKill() {}

  addChild(entity: Entity<any>): Entity<any> {
    super.addChild(entity)
    if (entity instanceof ViewElement && entity.yogaNode) {
      this.yogaNode.insertChild(entity.yogaNode, this.yogaNode.getChildCount())
      this.applyStyles()
    }
    return entity
  }

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

  get globalPos() {
    return this.transform.globalPos
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

  get uiContainer(): UIContainer | undefined {
    return this._uiContainer
  }

  set uiContainer(value: UIContainer) {
    this._uiContainer = value

    if (this._htmlElement) {
      value.htmlElement.appendChild(this._htmlElement)
    }
  }

  set html(node: (props: any) => HTMLElement) {
    if (this._htmlElement) {
      this._htmlElement.remove()
    }
    this._htmlElement = node(this._htmlProps)

    if (this.uiContainer) {
      this.uiContainer.htmlElement.appendChild(this._htmlElement)
    }
  }

  toCssPx(value: number) {
    return `calc(${value} * var(--px))`
  }

  get htmlProps() {
    if (!this.scene) return {}
    if (!this._htmlElement) return {}

    const screenPos = this.scene.engine.worldToScreenCoordinates(this.globalPos)

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

  get style(): StyleProps {
    return {
      flex: this.yogaNode.getDisplay(),
      position: this.yogaNode.getPositionType(),
      flexDirection: this.yogaNode.getFlexDirection(),
      width: this.width,
      height: this.height,
    }
  }

  set style(value: StyleProps) {
    if (value.gap) {
      this.yogaNode.setGap(Yoga.GUTTER_ALL, value.gap)
    }

    if (value.alignItems) {
      this.yogaNode.setAlignItems(value.alignItems)
    }

    if (value.justifyContent) {
      this.yogaNode.setJustifyContent(value.justifyContent)
    }

    if (value.flexWrap) {
      this.yogaNode.setFlexWrap(value.flexWrap)
    }

    if (value.width) {
      this.yogaNode.setWidth(value.width)
    }

    if (value.height) {
      this.yogaNode.setHeight(value.height)
    }

    if (value.flex) {
      this.yogaNode.setDisplay(value.flex)
    }

    if (value.position) {
      this.yogaNode.setPositionType(value.position)
    }

    if (value.flexDirection) {
      this.yogaNode.setFlexDirection(value.flexDirection)
    }

    this.applyStyles()
  }

  applyStyles() {
    // todo: optimize
    const apply = () => {
      this.width = this.yogaNode.getWidth().value
      this.height = this.yogaNode.getHeight().value
      this.pos.x = this.yogaNode.getComputedLeft()
      this.pos.y = this.yogaNode.getComputedTop()
    }
    if (this.uiContainer) {
      this.uiContainer.calculateLayout()
      apply()
    } else {
      this.once('initialize', () => {
        this.uiContainer?.calculateLayout()
        apply()
      })
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
